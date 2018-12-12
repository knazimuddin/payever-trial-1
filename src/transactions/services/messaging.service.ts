import { Injectable, HttpService } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, of } from 'rxjs';
import { map, tap, catchError, take, timeout } from 'rxjs/operators';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { RabbitmqClient } from '@pe/nest-kit/modules/rabbitmq';

import { TransactionsService } from './transactions.service';
import { BusinessPaymentOptionService } from './business-payment-option.service';
import { PaymentFlowService } from './payment-flow.service';

import { environment } from '../../environments';

@Injectable()
export class MessagingService {

  private rabbitClient: ClientProxy;

  private messageBusService: MessageBusService = new MessageBusService({
    rsa: environment.rsa,
  });

  private readonly rpcTimeout: number = 5000;

  constructor(
    private readonly httpService: HttpService,
    private readonly transactionsService: TransactionsService,
    private readonly bpoService: BusinessPaymentOptionService,
    private readonly flowService: PaymentFlowService,
  ) {
    this.rabbitClient = new RabbitmqClient(environment.rabbitmq);
  }

  getBusinessPaymentOption(transaction: any) {
    return this.bpoService.findOneById(transaction.business_option_id);
  }

  // Uncomment when payment flow will be retrieved from local projection
  getPaymentFlow(flowId: string) {
    return this.flowService.findOne(flowId);
  }

  async getActions(transaction, headers) {
    return new Promise(async (resolve, reject) => {
      let payload: any;
      try {
        payload = {
          action: 'action.list',
          data: await this.createPayloadData(transaction, headers),
        };
      } catch (error) {
        console.error('Could not prepare payload for actions call:', error);
        resolve([]);
      }

      const message = this.messageBusService.createPaymentMicroMessage(transaction.type, 'action', payload, environment.stub);

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
        resolve(actions);
      });
    });
  }

  async runAction(transaction, action, actionPayload, headers) {
    const dto = await this.createPayloadData(transaction, headers);
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
    updatedTransaction.payment_details = rpcResult.payment_details;
    updatedTransaction.items = rpcResult.payment_items;
    updatedTransaction.place = rpcResult.workflow_state;
    delete updatedTransaction.history; // we do not update history here. History events comming separately, there is a chance to overwrite saved history here
    this.transactionsService.prepareTransactionForInsert(updatedTransaction);
    await this.transactionsService.updateByUuid(updatedTransaction.uuid, updatedTransaction);
    return updatedTransaction;
  }

  async updateStatus(transaction, headers) {
    let dto;

    try {
      dto = await this.createPayloadData(transaction, headers);
    } catch (e) {
      throw new Error(`Cannot prepare dto for update status: ${e}`);
    }

    const payload = {
      action: 'status',
      data: dto,
    };

    const result: any = await this.runPaymentRpc(transaction, payload, 'payment');

    this.transactionsService.prepareTransactionForInsert(transaction);
    await this.transactionsService.updateByUuid(transaction.uuid, transaction);
    return transaction;
  }

  async sendTransactionUpdate(transaction) {
    this.transformTransactionForPhp(transaction);

    const message = this.messageBusService.createMessage('transactions_app.payment.updated', {
      payment: transaction,
    });

    this.rabbitClient.send({ channel: 'transactions_app.payment.updated', exchange: 'async_events' }, message).subscribe();
  }

  private async runPaymentRpc(transaction, payload, messageIdentifier) {
    return new Promise((resolve, reject) => {
      this.rabbitClient.send(
        { channel: this.messageBusService.getChannelByPaymentType(transaction.type, environment.stub) },
        this.messageBusService.createPaymentMicroMessage(transaction.type, messageIdentifier, payload, environment.stub),
      ).pipe(
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

  private async createPayloadData(transaction: any, headers: any) {
    transaction = Object.assign({}, transaction); // making clone before manipulations

    if (typeof(transaction.payment_details) === 'string') {
      try {
        transaction.payment_details = JSON.parse(transaction.payment_details);
      } catch(e) {
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

    dto = {...dto,
      payment: transaction,
      payment_details: transaction.payment_details,
      business: {
        id: 1 // dummy id - php guys say it doesnot affect anything... but can we trust it?)
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
    // @TODO ask FE to remove wrapper object
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
    return fields;
  }

  private transformTransactionForPhp(transaction) {
    transaction.id = transaction.original_id;
  }

}
