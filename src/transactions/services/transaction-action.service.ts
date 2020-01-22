import { Logger, Injectable, BadRequestException } from '@nestjs/common';

import { TransactionModel } from '../models';
import { ActionPayloadDto } from '../dto/action-payload';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { TransactionPaymentDetailsConverter } from '../converter';
import { TransactionsService } from './transactions.service';
import { DtoValidationService } from './dto-validation.service';
import { MessagingService } from './messaging.service';
import { TransactionsExampleService } from './transactions-example.service';

@Injectable()
export class TransactionActionService {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly dtoValidation: DtoValidationService,
    private readonly messagingService: MessagingService,
    private readonly logger: Logger,
    private readonly exampleService: TransactionsExampleService,
  ) {}

  public async doAction(
    transaction: TransactionModel,
    actionPayload: ActionPayloadDto,
    action: string,
  ): Promise<TransactionUnpackedDetailsInterface> {
    this.dtoValidation.checkFileUploadDto(actionPayload);
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    try {
      await this.messagingService.runAction(unpackedTransaction, action, actionPayload);
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

    const updatedTransaction: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByUuid(unpackedTransaction.uuid);
    /** Send update to checkout-php */
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occurred while sending transaction update: ${e.message}`);
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
            `/api/business/${transaction.business_uuid}/${transaction.uuid}/`
            + `label/${transaction.billing_address.id}.pdf`;
          transaction.example_shipping_slip =
            `/api/business/${transaction.business_uuid}/${transaction.uuid}/`
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
}