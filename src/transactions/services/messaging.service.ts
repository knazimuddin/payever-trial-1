import { Injectable, Logger } from '@nestjs/common';
import { InjectRabbitMqClient, RabbitMqClient } from '@pe/nest-kit';
import { MessageBusService } from '@pe/nest-kit/modules/message';
import { of } from 'rxjs';
import { catchError, map, take, timeout } from 'rxjs/operators';
import { environment } from '../../environments';
import { NextActionDto } from '../dto/next-action.dto';
import { ActionPayloadInterface, FieldsInterface, UnwrappedFieldsInterface } from '../interfaces/action-payload';
import { CheckoutTransactionInterface, CheckoutTransactionRpcActionInterface } from '../interfaces/checkout';
import { TransactionBasicInterface, TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { BusinessPaymentOptionModel, PaymentFlowModel } from '../models';
import { BusinessPaymentOptionService } from './business-payment-option.service';
import { PaymentFlowService } from './payment-flow.service';
import { PaymentsMicroService } from './payments-micro.service';
import { TransactionsService } from './transactions.service';

@Injectable()
export class MessagingService {

  private messageBusService: MessageBusService = new MessageBusService(
    {
      rsa: environment.rsa,
    },
    this.logger,
  );

  private readonly rpcTimeout: number = 30000;

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly bpoService: BusinessPaymentOptionService,
    private readonly flowService: PaymentFlowService,
    private readonly logger: Logger,
    private readonly paymentMicroService: PaymentsMicroService,
    @InjectRabbitMqClient() private readonly rabbitClient: RabbitMqClient,
  ) {}

  public getBusinessPaymentOption(transaction: TransactionBasicInterface): Promise<BusinessPaymentOptionModel> {
    return this.bpoService.findOneById(transaction.business_option_id);
  }

  public getPaymentFlow(flowId: string): Promise<PaymentFlowModel> {
    return this.flowService.findOneById(flowId);
  }

  public async getActionsList(transaction: TransactionUnpackedDetailsInterface): Promise<any[]> {
    let payload: any = null;
    try {
      const data = await this.createPayloadData(transaction);
      if (data) {
        payload = {
          action: 'action.list',
          data,
        };
      }
    } catch (e) {
      this.logger.error(
        {
          message: `Could not prepare payload for actions call`,
          transaction: transaction,
          error: e.message,
          context: 'MessagingService',
        },
      );

      return [];
    }

    const responseActions = await this.runPaymentRpc(transaction, payload, 'action');
    if (!responseActions) {
      return [];
    }

    let actions = Object.keys(responseActions).map((key) => ({
      action: key,
      enabled: responseActions[key],
    }));

    /**
     * This hack is only for FE improvement. FE for "Edit action" is not implemented in DK.
     * Thus we disable it here to prevent inconveniences.
     */
    if (transaction.type === 'santander_installment_dk') {
      actions = actions.filter(x => x.action !== 'edit');
    }

    return actions;
  }

  public async runAction(
    transaction: TransactionUnpackedDetailsInterface,
    action: string,
    actionPayload: ActionPayloadInterface,
  ): Promise<void> {
    let payload = null;

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

    const rpcResult: any = await this.runPaymentRpc(transaction, payload, 'action');
    this.logger.log({
      message: 'RPC action result',
      transaction: transaction,
      action: action,
      actionPayload: actionPayload,
      rpcResult: rpcResult,
      context: 'MessagingService',
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
        // stub for action behaviour
        break;
      case 'external_capture':
        await this.externalCapture(nextAction.payment_method, nextAction.payload);
        break;
    }
  }

  public async updateStatus(transaction: TransactionUnpackedDetailsInterface): Promise<void> {
    let payload = null;

    try {
      const dto = await this.createPayloadData(transaction);
      if (dto) {
        payload = {
          action: 'status',
          data: dto,
        };
      }
    } catch (e) {
      throw new Error(`Cannot prepare dto for update status: ${e}`);
    }

    const rpcResult: any = await this.runPaymentRpc(transaction, payload, 'payment');
    this.logger.log({
      message: 'RPC status update result',
      transaction: transaction,
      rpcResult: rpcResult,
      context: 'MessagingService',
    });
    await this.transactionsService.applyRpcResult(transaction, rpcResult);
  }

  public async externalCapture(
    paymentMethod: string,
    payload: any,
  ): Promise<any> {
    return this.rabbitClient.callAsync(
      {
        channel: this.paymentMicroService.getChannelByPaymentType(paymentMethod, environment.stub),
      },
      this.paymentMicroService.createPaymentMicroMessage(
        paymentMethod,
        'external_capture',
        payload,
        environment.stub,
      ),
    );
  }

  public async sendTransactionUpdate(transaction: TransactionUnpackedDetailsInterface): Promise<void> {
    const converted: CheckoutTransactionInterface = this.transformTransactionForPhp(transaction);
    const payload: any = { payment: converted };
    this.logger.log({
      message: 'SENDING "transactions_app.payment.updated" event',
      payload: payload,
      context: 'MessagingService',
    });
    const message = this.messageBusService.createMessage('transactions_app.payment.updated', payload);

    await this.rabbitClient
      .sendAsync(
        { channel: 'transactions_app.payment.updated', exchange: 'async_events' },
        message,
      );
  }

  // public prepareUpdatedTransaction(
  //   transaction: TransactionModel,
  //   rpcResult: RpcResultDto,
  // ): CheckoutTransactionInterface {
  //   const updatedTransaction: any = Object.assign({}, transaction, rpcResult.payment);
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
    payload,
    messageIdentifier,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.rabbitClient.send(
        { channel: this.paymentMicroService.getChannelByPaymentType(transaction.type, environment.stub) },
        this.paymentMicroService.createPaymentMicroMessage(
          transaction.type,
          messageIdentifier,
          payload,
          environment.stub,
        ),
      ).pipe(
        take(1),
        timeout(this.rpcTimeout),
        map((m) => this.messageBusService.unwrapRpcMessage(m)),
        catchError((e) => {
          reject(e);

          return of(null);
        }),
      ).subscribe((reply) => {
        resolve(reply);
      });
    });
  }

  private async createPayloadData(
    transaction: TransactionUnpackedDetailsInterface,
  ): Promise<CheckoutTransactionRpcActionInterface> {
    const payload: CheckoutTransactionInterface = Object.assign({}, transaction);

    this.fixDates(payload);
    this.fixId(payload);

    payload.address = transaction.billing_address;
    // @TODO this should be done on BE side
    payload.reference = transaction.uuid;

    const dto: CheckoutTransactionRpcActionInterface = {
      payment: payload,
      payment_details: transaction.payment_details,
      business: {
        id: transaction.business_uuid,
      },
    };

    try {
      const businessPaymentOption: BusinessPaymentOptionModel = await this.getBusinessPaymentOption(transaction);
      dto.credentials = businessPaymentOption.credentials;

      this.logger.log(
        {
          message: `Transaction ${transaction.uuid} dto credentials`,
          transaction: payload,
          credentials: dto.credentials,
          context: 'MessagingService',
        },
      );
    } catch (e) {
      throw new Error(`Transaction:${transaction.uuid} -> Cannot resolve business payment option: ${e}`);
    }

    try {
      const paymentFlow: PaymentFlowModel = await this.getPaymentFlow(transaction.payment_flow_id);
      if (!paymentFlow) {
        this.logger.error(
          {
            message: `Transaction ${transaction.uuid} -> Payment flow cannot be null`,
            transaction: payload,
            context: 'MessagingService',
          },
        );

        return null;
      }

      if (payload.payment_flow_id) {
        dto.payment_flow = paymentFlow.toObject();
        dto.payment_flow.business_payment_option = await this.getBusinessPaymentOption(transaction);
      }
    } catch (e) {
      console.log(e);

      this.logger.error(
        {
          message: `Transaction ${transaction.uuid} -> Cannot resolve payment flow`,
          transaction: payload,
          error: e,
          context: 'MessagingService',
        },
      );

      return null;
    }

    return dto;
  }

  private fixDates(transaction) {
    Object.keys(transaction).forEach((key) => {
      if (transaction[key] instanceof Date) {
        // @TODO fix time shift issues
        transaction[key] = transaction[key].toISOString().split('.')[0] + '+00:00';
      }
    });
  }

  private fixId(transaction) {
    transaction.id = transaction.original_id;
  }

  private prepareActionFields(
    transaction: TransactionBasicInterface,
    action: string,
    fields: FieldsInterface & UnwrappedFieldsInterface,
  ) {
    // @TODO ask FE to remove wrapper object!
    if ((action === 'refund' || action === 'return') && fields.payment_return) {
      fields.amount = fields.payment_return.amount || fields.amount || 0.0;
      fields.reason = fields.payment_return.reason || fields.reason || null;
      fields.refunded_amount = transaction.amount_refunded;
      // php BE asked for camel case version of this field too
      fields.refundedAmount = fields.refunded_amount;
    }
    if (action === 'change_amount' && fields.payment_change_amount) {
      fields.amount = fields.payment_change_amount.amount || fields.amount || 0;
    }
    if (action === 'edit' && fields.payment_update) {
      fields = {
        ...fields,
        reason: fields.payment_update.reason,
        payment_items: fields.payment_update.updateData
          ? fields.payment_update.updateData.productLine
          : []
        ,
        delivery_fee: fields.payment_update.updateData
          ? parseFloat(fields.payment_update.updateData.deliveryFee)
          : null
        ,
      };
    }

    return fields;
  }

  private transformTransactionForPhp(
    transaction: TransactionUnpackedDetailsInterface,
  ): CheckoutTransactionInterface {
    const payload: CheckoutTransactionInterface = Object.assign({}, transaction);
    payload.id = transaction.original_id;

    return payload;
  }
}
