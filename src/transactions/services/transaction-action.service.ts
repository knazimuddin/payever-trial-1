import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { TransactionPaymentDetailsConverter } from '../converter';
import { ActionPayloadDto } from '../dto/action-payload';
import { AllowedUpdateStatusPaymentMethodsEnum, PaymentStatusesEnum, ThirdPartyPaymentsEnum, PaymentActionsEnum } from '../enum';
import { ActionCallerInterface } from '../interfaces';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';

import { TransactionModel } from '../models';
import { DtoValidationService } from './dto-validation.service';
import { MessagingService } from './messaging.service';
import { ThirdPartyCallerService } from './third-party-caller.service';
import { TransactionsExampleService } from './transactions-example.service';
import { TransactionsService } from './transactions.service';
import { AccessTokenPayload, EventDispatcher } from '@pe/nest-kit';
import { PaymentActionEventEnum } from '../enum/events';

@Injectable()
export class TransactionActionService {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly dtoValidation: DtoValidationService,
    private readonly messagingService: MessagingService,
    private readonly thirdPartyCallerService: ThirdPartyCallerService,
    private readonly logger: Logger,
    private readonly exampleService: TransactionsExampleService,
    private readonly eventDispatcher: EventDispatcher,
  ) { }

  public async doAction(
    transaction: TransactionModel,
    actionPayload: ActionPayloadDto,
    action: string,
    user: AccessTokenPayload = null,
    skipValidation: boolean = false,
  ): Promise<TransactionUnpackedDetailsInterface> {
    this.dtoValidation.checkFileUploadDto(actionPayload);
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    try {
      const actionCallerService: ActionCallerInterface = this.chooseActionCallerService(unpackedTransaction);

      await this.eventDispatcher.dispatch(
        PaymentActionEventEnum.PaymentActionBefore,
        transaction,
        actionPayload,
        action,
        skipValidation,
      );

      let updatedActionPayload: ActionPayloadDto = actionPayload;
      if (action === PaymentActionsEnum.ShippingGoods) {
        updatedActionPayload = this.updateAmountFromItems(actionPayload);
        let fee_amount: number = 0;
        fee_amount = transaction.delivery_fee ? fee_amount + transaction.delivery_fee : fee_amount;
        fee_amount = transaction.payment_fee ? fee_amount + transaction.payment_fee : fee_amount;
        if (updatedActionPayload.fields && updatedActionPayload.fields.amount &&
          (updatedActionPayload.fields.amount === (transaction.amount_capture_rest - fee_amount))
        ) {
          updatedActionPayload.fields.amount += fee_amount;
        }
      }

      await actionCallerService.runAction(unpackedTransaction, action, updatedActionPayload);
    } catch (e) {
      this.logger.log(
        {
          context: 'BusinessController',
          error: e.message,
          message: `Error occurred during running action`,
        },
      );

      throw new BadRequestException(e.message);
    }

    transaction = await this.transactionsService.findModelByUuid(unpackedTransaction.uuid);

    await this.eventDispatcher.dispatch(
      PaymentActionEventEnum.PaymentActionAfter,
      transaction,
      actionPayload,
      action,
      user,
    );

    return this.transactionsService.findUnpackedByUuid(unpackedTransaction.uuid);
  }

  public async updateStatus(
    transaction: TransactionModel,
  ): Promise<TransactionUnpackedDetailsInterface> {
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    const disabledUpdateStatuses: string[] = [
      PaymentStatusesEnum.Paid,
    ];

    if (!Object.values(AllowedUpdateStatusPaymentMethodsEnum).includes(
        unpackedTransaction.type as AllowedUpdateStatusPaymentMethodsEnum,
      )
      || disabledUpdateStatuses.includes(unpackedTransaction.status)
    ) {
      return unpackedTransaction;
    }

    const oldStatus: string = unpackedTransaction.status;
    const oldSpecificStatus: string = unpackedTransaction.specific_status;

    try {
      const actionCallerService: ActionCallerInterface = this.chooseActionCallerService(unpackedTransaction);

      await actionCallerService.updateStatus(unpackedTransaction);
    } catch (e) {
      this.logger.error(
        {
          context: 'TransactionActionService',
          error: e.message,
          message: `Error occurred during status update`,
          paymentId: unpackedTransaction.original_id,
          paymentUuid: unpackedTransaction.id,
        },
      );
      throw new BadRequestException(`Error occurred during status update. Please try again later. ${e.message}`);
    }

    const updatedTransaction: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByUuid(transaction.uuid);

    const newStatus: string = updatedTransaction.status;
    const newSpecificStatus: string = updatedTransaction.specific_status;

    if (newStatus !== oldStatus || newSpecificStatus !== oldSpecificStatus) {
      /** Send update to checkout-php */
      try {
        await this.messagingService.sendTransactionUpdate(updatedTransaction);
      } catch (e) {
        this.logger.error(
          {
            context: 'TransactionActionService',
            error: e.message,
            message: 'Error occurred while sending transaction update',
            paymentId: unpackedTransaction.original_id,
            paymentUuid: unpackedTransaction.id,
          },
        );
      }
    }

    return updatedTransaction;
  }

  public async doFakeAction(
    transaction: TransactionModel,
    actionPayload: ActionPayloadDto,
    action: string,
  ): Promise<TransactionUnpackedDetailsInterface> {
    switch (action) {
      case 'shipping_goods':
        transaction.status = 'STATUS_PAID';
        transaction.place = 'paid';
        transaction.shipping_order_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
        if (
          transaction.billing_address.id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' ||
          transaction.billing_address.id === 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' ||
          transaction.billing_address.id === 'cccccccc-cccc-cccc-cccc-cccccccccccc'
        ) {
          transaction.example_shipping_label =
            `/api/business/${transaction.businessId}/${transaction.uuid}/`
            + `label/${transaction.billing_address.id}.pdf`;
          transaction.example_shipping_slip =
            `/api/business/${transaction.businessId}/${transaction.uuid}/`
            + `slip/${transaction.billing_address.id}.json`;

        }

        break;
      case 'refund':
        transaction.status = 'STATUS_REFUNDED';
        transaction.place = 'refunded';
        await this.exampleService.refundExample(transaction, actionPayload.fields.payment_return.amount);

        break;
      case 'cancel':
        transaction.status = 'STATUS_CANCELLED';
        transaction.place = 'cancelled';

        break;
      default:
    }

    await transaction.save();

    return this.transactionsService.findUnpackedByUuid(transaction.uuid);
  }

  private chooseActionCallerService(
    unpackedTransaction: TransactionUnpackedDetailsInterface,
  ): ActionCallerInterface {
    const thirdPartyMethods: string[] = Object.values(ThirdPartyPaymentsEnum);

    return thirdPartyMethods.includes(unpackedTransaction.type)
      ? this.thirdPartyCallerService
      : this.messagingService;
  }

  private updateAmountFromItems(actionPayload: ActionPayloadDto): ActionPayloadDto {
    const updatedActionPayload: ActionPayloadDto = actionPayload;
    if (updatedActionPayload.fields && updatedActionPayload.fields.payment_items) {
      let itemsTotalAmount: number = 0;
      updatedActionPayload.fields.payment_items.forEach(( item: any ) => {
        if (item.price && item.quantity) {
          itemsTotalAmount += (item.price * item.quantity);
        }
      });
      updatedActionPayload.fields.amount = itemsTotalAmount;
    }

    return updatedActionPayload;
  }

}
