import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageBusService, MessageInterface, RabbitMqClient, RabbitMqRPCClient } from '@pe/nest-kit';
import { TransactionConverter } from '../converter';
import { NextActionDto } from '../dto';
import { ActionCallerInterface, ActionItemInterface, PaymentFlowInterface } from '../interfaces';
import { ActionPayloadInterface, FieldsInterface, UnwrappedFieldsInterface } from '../interfaces/action-payload';
import {
  CheckoutRpcPayloadInterface,
  CheckoutTransactionInterface,
  CheckoutTransactionRpcActionInterface,
} from '../interfaces/checkout';
import { TransactionBasicInterface, TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { BusinessPaymentOptionModel, PaymentFlowModel } from '../models';
import { BusinessPaymentOptionService } from './business-payment-option.service';
import { PaymentFlowService } from './payment-flow.service';
import { PaymentsMicroService } from './payments-micro.service';
import { TransactionsService } from './transactions.service';
import { AllowedUpdateStatusPaymentMethodsEnum, RpcMessageIdentifierEnum } from '../enum';

@Injectable()
export class MessagingService implements ActionCallerInterface {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly bpoService: BusinessPaymentOptionService,
    private readonly flowService: PaymentFlowService,
    private readonly paymentMicroService: PaymentsMicroService,
    private readonly rabbitRpcClient: RabbitMqRPCClient,
    private readonly rabbitClient: RabbitMqClient,
    private readonly logger: Logger,
    private readonly messageBusService: MessageBusService,
    private readonly configService: ConfigService,
  ) { }

  public getBusinessPaymentOption(transaction: TransactionBasicInterface): Promise<BusinessPaymentOptionModel> {
    return this.bpoService.findOneById(transaction.business_option_id);
  }

  public getPaymentFlow(flowId: string): Promise<PaymentFlowModel> {
    return this.flowService.findOneById(flowId);
  }

  public async getActionsList(
    transaction: TransactionUnpackedDetailsInterface,
  ): Promise<ActionItemInterface[]> {
    let payload: CheckoutRpcPayloadInterface;
    try {
      const data: CheckoutTransactionRpcActionInterface = await this.createPayloadData(transaction);
      if (data) {
        payload = {
          action: 'action.list',
          data,
        };
      }
    } catch (e) {
      this.logger.error(
        {
          context: 'MessagingService',
          error: e.message,
          message: `Could not prepare payload for actions call`,
          transaction: transaction,
        },
      );

      return [];
    }

    const actionsResponse: { [key: string]: boolean } =
      await this.runPaymentRpc(transaction, payload, RpcMessageIdentifierEnum.Action);
    if (!actionsResponse) {
      return [];
    }

    let actions: ActionItemInterface[] = Object.keys(actionsResponse)
      .map(
        (key: string) => ({
          action: key,
          enabled: actionsResponse[key],
        }),
      );

    /**
     * This hack is only for FE improvement. FE for "Edit action" is not implemented in DK.
     * Thus we disable it here to prevent inconveniences.
     */
    if (transaction.type === 'santander_installment_dk') {
      actions = actions.filter((x: ActionItemInterface) => x.action !== 'edit');
    }

    return actions;
  }

  public async runAction(
    transaction: TransactionUnpackedDetailsInterface,
    action: string,
    actionPayload: ActionPayloadInterface,
  ): Promise<void> {
    let payload: CheckoutRpcPayloadInterface;
    try {
      const dto: CheckoutTransactionRpcActionInterface = await this.createPayloadData(transaction);
      if (dto) {
        if (action === 'capture' && actionPayload.fields.capture_funds) {
          dto.payment.amount = parseFloat(actionPayload.fields.capture_funds.amount);
        }

        dto.payment_items = transaction.items;

        dto.action = action;

        if (actionPayload.fields) {
          dto.fields = this.prepareActionFields(transaction, action, actionPayload.fields);
        }

        if (actionPayload.files) {
          dto.files = actionPayload.files;
        }

        payload = {
          action: 'action.do',
          data: dto,
        };
      }
    } catch (e) {
      throw new Error(`Cannot prepare dto for run action: ${e}`);
    }

    const rpcResult: any = await this.runPaymentRpc(transaction, payload, RpcMessageIdentifierEnum.Action);
    this.logger.log({
      action: action,
      actionPayload: actionPayload,
      context: 'MessagingService',
      message: 'RPC action result',
      rpcResult: rpcResult,
      transaction: transaction,
    });

    await this.transactionsService.applyActionRpcResult(transaction, rpcResult);

    if (rpcResult && rpcResult.next_action) {
      const updatedTransaction: TransactionUnpackedDetailsInterface =
        await this.transactionsService.findUnpackedByUuid(transaction.uuid);
      await this.runNextAction(updatedTransaction, rpcResult.next_action);
    }
  }

  public async runNextAction(
    transaction: TransactionUnpackedDetailsInterface,
    nextAction: NextActionDto,
  ): Promise<void> {
    switch (nextAction.type) {
      case 'action':
        /** stub for action behaviour */
        break;
      case 'external_capture':
        await this.externalCapture(nextAction.payment_method, nextAction.payload);
        break;
    }
  }

  public async updateStatus(transaction: TransactionUnpackedDetailsInterface): Promise<void> {
    let payload: CheckoutRpcPayloadInterface;
    try {
      const dto: CheckoutTransactionRpcActionInterface = await this.createPayloadData(transaction);
      if (dto) {
        payload = {
          action: 'status',
          data: dto,
        };
      }
    } catch (e) {
      throw new Error(`Cannot prepare dto for update status: ${e}`);
    }

    const rpcResult: any = await this.runPaymentRpc(transaction, payload, RpcMessageIdentifierEnum.Payment);
    this.logger.log({
      context: 'MessagingService',
      message: 'RPC status update result',
      rpcResult: rpcResult,
      transaction: transaction,
    });
    await this.transactionsService.applyRpcResult(transaction, rpcResult);
  }

  public async externalCapture(
    paymentMethod: string,
    payload: any,
  ): Promise<void> {
    const stub: boolean = this.configService.get<boolean>('STUB');
    await this.rabbitRpcClient.send(
      {
        channel: this.paymentMicroService.getChannelByPaymentType(paymentMethod, stub),
      },
      this.paymentMicroService.createPaymentMicroMessage(
        paymentMethod,
        'external_capture',
        payload,
        stub,
      ),
    );
  }

  public async sendTransactionUpdate(transaction: TransactionUnpackedDetailsInterface): Promise<void> {
    const converted: CheckoutTransactionInterface = TransactionConverter.toCheckoutTransaction(transaction);
    const payload: { payment: CheckoutTransactionInterface } = { payment: converted };
    this.logger.log({
      context: 'MessagingService',
      message: 'SENDING "transactions_app.payment.updated" event',
      payload: payload,
    });
    const message: MessageInterface = this.messageBusService.createMessage(
      'transactions_app.payment.updated',
      payload,
    );

    await this.rabbitClient
      .send(
        { channel: 'transactions_app.payment.updated', exchange: 'async_events' },
        message,
      );
  }

  // public prepareUpdatedTransaction(
  //   transaction: TransactionModel,
  //   rpcResult: RpcResultDto,
  // ): CheckoutTransactionInterface {
  //   const updatedTransaction: any = Object.assign({ }, transaction, rpcResult.payment);
  //   updatedTransaction.payment_details = this.checkRPCResponsePropertyExists(rpcResult.payment_details)
  //     ? rpcResult.payment_details
  //     : transaction.payment_details
  //   ;
  //   updatedTransaction.items = rpcResult.payment_items && rpcResult.payment_items.length
  //     ? rpcResult.payment_items
  //     : transaction.items
  //   ;
  //
  //   this.logger.log('Updated transaction: ', updatedTransaction);
  //   delete updatedTransaction.history;
  //
  //   return updatedTransaction;
  // }

  // private checkRPCResponsePropertyExists(prop: any): boolean {
  //   if (Array.isArray(prop)) {
  //     return !!prop.length;
  //   }
  //   else {
  //     return !!prop;
  //   }
  // }

  private async runPaymentRpc(
    transaction: TransactionUnpackedDetailsInterface,
    payload: CheckoutRpcPayloadInterface,
    messageIdentifier: RpcMessageIdentifierEnum,
  ): Promise<any> {
    const stub: boolean = this.configService.get<string>('STUB') === 'true';
    let channel: string = this.paymentMicroService.getChannelByPaymentType(transaction.type, stub);

    if (messageIdentifier === RpcMessageIdentifierEnum.Payment
      && Object.values(AllowedUpdateStatusPaymentMethodsEnum).includes(
        transaction.type as AllowedUpdateStatusPaymentMethodsEnum,
      )
    ) {
      // status update uses separate channel
      channel += '_status';
    }

    const result: any = await this.rabbitRpcClient.send(
      {
        channel,
      },
      this.paymentMicroService.createPaymentMicroMessage(
        transaction.type,
        messageIdentifier,
        payload,
        stub,
      ),
    );

    return this.messageBusService.unwrapRpcMessage(result);
  }

  private async createPayloadData(
    transaction: TransactionUnpackedDetailsInterface,
  ): Promise<CheckoutTransactionRpcActionInterface> {
    const payload: CheckoutTransactionInterface = TransactionConverter.toCheckoutTransaction(transaction);
    const dto: CheckoutTransactionRpcActionInterface = {
      business: {
        id: transaction.business_uuid,
      },
      payment: payload,
      payment_details: transaction.payment_details,
    };

    await this.applyBusinessPaymentOptionToRpcPayload(dto, transaction);
    await this.applyPaymentFlowToRpcPayload(dto, transaction);

    return dto;
  }

  private async applyBusinessPaymentOptionToRpcPayload(
    dto: CheckoutTransactionRpcActionInterface,
    transaction: TransactionUnpackedDetailsInterface,
  ): Promise<void> {
    try {
      const businessPaymentOption: BusinessPaymentOptionModel = await this.getBusinessPaymentOption(transaction);
      dto.credentials = businessPaymentOption.credentials;

      this.logger.log(
        {
          context: 'MessagingService',
          message: 'Successfully applied business payment option credentials to payload',
          transactionId: transaction.uuid,
          transactionOriginalId: transaction.original_id,
        },
      );
    } catch (e) {
      this.logger.log(
        {
          context: 'MessagingService',
          error: e.message,
          message: 'Failed to apply business payment option credentials to payload',
          transactionId: transaction.uuid,
          transactionOriginalId: transaction.original_id,
        },
      );

      throw new Error(`Transaction:${transaction.uuid} -> Cannot resolve business payment option: ${e}`);
    }
  }

  private async applyPaymentFlowToRpcPayload(
    dto: CheckoutTransactionRpcActionInterface,
    transaction: TransactionUnpackedDetailsInterface,
  ): Promise<void> {
    if (!transaction.payment_flow_id) {
      return;
    }

    try {
      const paymentFlow: PaymentFlowModel = await this.getPaymentFlow(transaction.payment_flow_id);
      if (paymentFlow) {
        dto.payment_flow = paymentFlow.toObject();
        dto.payment_flow.business_payment_option = await this.getBusinessPaymentOption(transaction);
      } else {
        this.logger.log(
          {
            context: 'MessagingService',
            flowId: transaction.payment_flow_id,
            message: 'Could not apply flow to payload - Payment flow not found',
            transactionId: transaction.uuid,
            transactionOriginalId: transaction.original_id,
          },
        );

        dto.payment_flow = { } as PaymentFlowInterface;
        dto.payment_flow.business_payment_option = await this.getBusinessPaymentOption(transaction);
      }
    } catch (e) {
      this.logger.log(
        {
          context: 'MessagingService',
          error: e.message,
          flowId: transaction.payment_flow_id,
          message: 'Failed to apply payment flow to payload',
          transactionId: transaction.uuid,
          transactionOriginalId: transaction.original_id,
        },
      );
    }
  }

  private prepareActionFields(
    transaction: TransactionBasicInterface,
    action: string,
    fields: FieldsInterface & UnwrappedFieldsInterface,
  ): FieldsInterface & UnwrappedFieldsInterface {
    // @TODO ask FE to remove wrapper object!
    if ((action === 'refund' || action === 'return') && fields.payment_return) {
      fields.amount = fields.payment_return.amount || fields.amount || 0.0;
      fields.reason = fields.payment_return.reason || fields.reason || null;
      fields.refunded_amount = transaction.amount_refunded;
      /** php microservices use JMS Serializer, thus need this field in camel case also */
      fields.refundedAmount = fields.refunded_amount;
    }
    if (action === 'change_amount' && fields.payment_change_amount) {
      fields.amount = fields.payment_change_amount.amount || fields.amount || 0;
    }
    if (action === 'edit' && fields.payment_update) {
      fields = {
        ...fields,
        delivery_fee: fields.payment_update.updateData
          ? parseFloat(fields.payment_update.updateData.deliveryFee)
          : null
        ,
        payment_items: fields.payment_update.updateData
          ? fields.payment_update.updateData.productLine
          : []
        ,
        reason: fields.payment_update.reason,
      };
    }

    return fields;
  }
}
