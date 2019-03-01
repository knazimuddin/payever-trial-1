import { HttpService, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { RabbitmqClient } from '@pe/nest-kit/modules/rabbitmq';
import { of } from 'rxjs';
import { catchError, map, take, timeout } from 'rxjs/operators';

import { environment } from '../../environments';
import { BusinessPaymentOptionService } from './business-payment-option.service';
import { PaymentFlowService } from './payment-flow.service';

import { TransactionsService } from './transactions.service';

@Injectable()
export class MessagingService {

  private rabbitClient: RabbitmqClient;

  private messageBusService: MessageBusService = new MessageBusService({
    rsa: environment.rsa,
  });

  private readonly rpcTimeout: number = 30000;

  constructor(
    private readonly httpService: HttpService,
    private readonly transactionsService: TransactionsService,
    private readonly bpoService: BusinessPaymentOptionService,
    private readonly flowService: PaymentFlowService,
  ) {
    this.rabbitClient = new RabbitmqClient(environment.rabbitmq);
  }

  public getBusinessPaymentOption(transaction: any) {
    return this.bpoService.findOneById(transaction.business_option_id);
  }

  // Uncomment when payment flow will be retrieved from local projection
  public getPaymentFlow(flowId: string) {
    return this.flowService.findOne(flowId);
  }

  public async getActions(transaction): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      let payload: any;
      try {
        payload = {
          action: 'action.list',
          data: await this.createPayloadData(transaction),
        };
      } catch (error) {
        console.error('Could not prepare payload for actions call:', error);
        resolve([]);
      }

      const message = this.messageBusService.createPaymentMicroMessage(
        transaction.type,
        'action',
        payload,
        environment.stub,
      );

      this.rabbitClient.send(
        { channel: this.messageBusService.getChannelByPaymentType(transaction.type, environment.stub) },
        message,
      ).pipe(
        take(1),
        timeout(this.rpcTimeout),
        map((msg) => this.messageBusService.unwrapRpcMessage(msg)),
        map((actions) => {
          return Object.keys(actions).map((key) => ({
            action: key,
            enabled: actions[key],
          }));
        }),
        catchError((e) => {
          console.error(`Error while resolving actions by rpc call:`, e);

          return of([]);
        }),
      ).subscribe((actions) => {
        // TODO: Temp exclude edit action for santander_installment_dk until it's not done yet
        if (transaction.type === 'santander_installment_dk') {
          actions = actions.filter(x => x.action !== 'edit');
        }
        resolve(actions);
      });
    });
  }

  public async runAction(transaction, action, actionPayload) {
    let dto;

    try {
      dto = await this.createPayloadData(transaction);
    } catch (e) {
      throw new Error(`Cannot prepare dto for run action: ${e}`);
    }

    if (action === 'capture' && actionPayload.fields.capture_funds) {
      dto.payment.amount = actionPayload.fields.capture_funds.amount;
    }

    dto.action = action;

    if (actionPayload.fields) {
      dto.fields = this.prepareActionFields(transaction, action, actionPayload.fields);
    }

    if (actionPayload.files) {
      dto.files = actionPayload.files;
    }

    const payload = {
      action: 'action.do',
      data: dto,
    };
    const rpcResult: any = await this.runPaymentRpc(transaction, payload, 'action');
    const updatedTransaction: any = Object.assign({}, transaction, rpcResult.payment);
    console.log('RPC result: ', updatedTransaction);
    updatedTransaction.payment_details = this.checkRPCResponsePropertyExists(rpcResult.payment_details)
      ? rpcResult.payment_details : transaction.payment_details;
    updatedTransaction.items = rpcResult.payment_items && rpcResult.payment_items.length
      ? rpcResult.payment_items : transaction.items;
    console.log('Updated transaction: ', updatedTransaction);
    // We do not update history here.
    // History events coming separately, there is a chance to overwrite saved history here
    delete updatedTransaction.history;
    this.transactionsService.prepareTransactionForInsert(updatedTransaction);
    await this.transactionsService.updateByUuid(updatedTransaction.uuid, updatedTransaction);

    return updatedTransaction;
  }

  private checkRPCResponsePropertyExists(prop: any): boolean {
    if (Array.isArray(prop)) {
      return !!prop.length;
    }
    else {
      return !!prop;
    }
  }

  public async updateStatus(transaction) {
    let dto;

    try {
      dto = await this.createPayloadData(transaction);
    } catch (e) {
      throw new Error(`Cannot prepare dto for update status: ${e}`);
    }

    const payload = {
      action: 'status',
      data: dto,
    };

    const rpcResult: any = await this.runPaymentRpc(transaction, payload, 'payment');
    const rpcPayment: any = rpcResult.payment;

    const updatedTransaction: any = Object.assign(
      {},
      transaction,
      {
        place: rpcPayment.place,
        status: rpcPayment.status ? rpcPayment.status : transaction.status,
        specific_status: rpcPayment.specific_status ? rpcPayment.specific_status : transaction.specific_status,
        payment_details: rpcResult.payment_details ? rpcResult.payment_details : transaction.payment_details,
      }
    );

    this.transactionsService.prepareTransactionForInsert(updatedTransaction);
    await this.transactionsService.updateByUuid(transaction.uuid, updatedTransaction);

    return transaction;
  }

  public async sendTransactionUpdate(transaction) {
    this.transformTransactionForPhp(transaction);
    const payload: any = { payment: transaction };
    console.log(`SEND 'transactions_app.payment.updated', payload:`, payload);
    const message = this.messageBusService.createMessage('transactions_app.payment.updated', payload);

    await this.rabbitClient
      .sendAsync(
        { channel: 'transactions_app.payment.updated', exchange: 'async_events' },
        message,
      );
  }

  private async runPaymentRpc(transaction, payload, messageIdentifier) {
    return new Promise((resolve, reject) => {
      this.rabbitClient.send(
        { channel: this.messageBusService.getChannelByPaymentType(transaction.type, environment.stub) },
        this.messageBusService.createPaymentMicroMessage(
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

  private async createPayloadData(transaction: any) {
    transaction = Object.assign({}, transaction); // making clone before manipulations

    if (typeof (transaction.payment_details) === 'string') {
      try {
        transaction.payment_details = JSON.parse(transaction.payment_details);
      } catch (e) {
        console.log(e);
        transaction.payment_details = {};
        // just skipping payment_details
      }
    }

    let dto: any = {};
    let businessPaymentOption;
    let paymentFlow;

    this.fixDates(transaction);
    this.fixId(transaction);

    transaction.address = transaction.billing_address;
    // @TODO this should be done on BE side
    transaction.reference = transaction.uuid;

    dto = {
      ...dto,
      payment: transaction,
      payment_details: transaction.payment_details,
      business: {
        // dummy id - php guys say it does not affect anything... but can we trust it?)
        id: 1,
      },
    };

    try {
      businessPaymentOption = await this.getBusinessPaymentOption(transaction);
    } catch (e) {
      throw new Error(`Cannot resolve business payment option: ${e}`);
    }

    try {
      paymentFlow = await this.getPaymentFlow(transaction.payment_flow_id);
    } catch (e) {
      throw new Error(`Cannot resolve payment flow: ${e}`);
    }

    if (!paymentFlow) {
      throw new Error(`Payment flow cannot be null.`);
    }
    dto.credentials = businessPaymentOption.credentials;
    console.log('dto credentials: ');
    console.log(dto.credentials);

    if (transaction.payment_flow_id) {
      dto.payment_flow = paymentFlow;
      dto.payment_flow.business_payment_option = businessPaymentOption;
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

  private prepareActionFields(transaction, action: string, fields: any) {
    // @TODO ask FE to remove wrapper object!
    if ((action === 'refund' || action === 'return') && fields.payment_return) {
      fields.amount = fields.payment_return.amount || fields.amount || 0;
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
          : [],
        delivery_fee: fields.payment_update.updateData
          ? fields.payment_update.updateData.deliveryFee
          : null,
      };
    }

    return fields;
  }

  private transformTransactionForPhp(transaction) {
    transaction.id = transaction.original_id;
    if (typeof (transaction.payment_details) === 'string') {
      try {
        transaction.payment_details = JSON.parse(transaction.payment_details);
      } catch (e) {
        console.log(e);
        transaction.payment_details = {};
        // just skipping payment_details
      }
    }
  }
}
