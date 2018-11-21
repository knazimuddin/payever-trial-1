import { Injectable, HttpService } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, of } from 'rxjs';
import { map, tap, catchError, take } from 'rxjs/operators';

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

  // async getBusinessPaymentOption(transaction: any, headers) {
    // if (transaction.channel_set_id) {
      // // remove this branch when all transaction.business_option_id will be synced with new DB
      // const paymentOptionsList = (await this.httpService.get(`${environment.checkoutMicroUrlBase}api/rest/v1/payment-options`).toPromise()).data as any[];
      // const paymentOption = paymentOptionsList.find((po) => po.payment_method === transaction.type);
      // const businessPaymentOptions = (await this.httpService.get(`${environment.checkoutMicroUrlBase}api/rest/v1/business-payment-option/channel-set/${transaction.channel_set_id}`).toPromise()).data as any[];
      // const businessPaymentOption = businessPaymentOptions.find((bpo) => bpo.payment_option_id === paymentOption.id);
      // const paymentMethodData = (await this.httpService.get(
        // `${environment.checkoutMicroUrlBase}api/rest/v1/business-payment-option/${businessPaymentOption.id}`,
        // { headers: { authorization: headers.authorization } },
      // ).toPromise()).data;
      // return paymentMethodData;
    // } else {
      // const paymentMethodData = (await this.httpService.get(
        // `${environment.checkoutMicroUrlBase}api/rest/v1/business-payment-option/${transaction.business_option_id}`,
        // { headers: { authorization: headers.authorization } },
      // ).toPromise()).data;
      // return paymentMethodData;
    // }
  // }

  // getPaymentFlow(flowId: string) {
    // return this.flowService.findOne(flowId);
  // }

  async getPaymentFlow(flowId: string) {
    return new Promise((resolve, reject) => {
      const payload = {
        'payment_flow_id': flowId,
      };
      const message = this.messageBusService.createMessage('retrive_payment_flow', payload);

      try {
        this.rabbitClient.send(
          { channel: 'rpc_checkout_micro' },
          message,
        ).pipe(
          take(1),
          map((msg) => this.messageBusService.unwrapRpcMessage(msg)),
          map((response) => response.payment_flow_d_t_o),
          // tap((msg) => console.log('PAYMENT FLOW MSG', msg)),
          catchError((e) => {
            console.error(`Error while sending rpc call:`, e);
            reject(e);
            return of(null);
          }),
        ).subscribe((actions) => {
          resolve(actions);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async getActions(transaction, headers) {
    return new Promise(async (resolve, reject) => {
      try {
        const payload = {
          action: 'action.list',
          data: await this.createPayloadData(transaction, headers),
        };

        const message = this.messageBusService.createPaymentMicroMessage(transaction.type, 'action', payload, environment.stub);

        // console.log('CHECK MESSAGE BEFORE SEND', message);

        this.rabbitClient.send(
          { channel: this.messageBusService.getChannelByPaymentType(transaction.type, environment.stub) },
          message,
        ).pipe(
          take(1),
          map((msg) => this.messageBusService.unwrapRpcMessage(msg)),
          // tap((msg) => console.log('unwrapped message', msg)),
          map((actions) => {
            return Object.keys(actions).map((key) => ({
              action: key,
              enabled: actions[key],
            }));
          }),
          tap((actions) => console.log('actions:', actions)),
          catchError((e) => {
            console.error(`Error while sending rpc call:`, e);
            reject(e);
            return of(null);
          }),
        ).subscribe((actions) => {
          resolve(actions);
        });
      } catch (error) {
        reject(error);
      }
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

    console.log('RUN ACTION PAYLOAD:', payload.data);

    const rpcResult: any = await this.runPaymentRpc(transaction, payload, 'action');

    // console.log('RPC ACTION RESULT:', rpcResult);
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
    const dto = await this.createPayloadData(transaction, headers);

    const payload = {
      action: 'status',
      data: dto,
    };

    const result: any = await this.runPaymentRpc(transaction, payload, 'payment');

    console.log('update status result', result);

    // const update: any = {};
    // if (result.payment.status) {
      // update.status = result.payment.status;
    // }
    // if (result.payment.specific_status) {
      // update.specific_status = result.payment.specific_status;
    // }

    this.transactionsService.prepareTransactionForInsert(transaction);
    console.log('prepare transaction result', transaction);
    await this.transactionsService.updateByUuid(transaction.uuid, transaction);
    return transaction;
  }

  async sendTransactionUpdate(transaction) {
    this.transformTransactionForPhp(transaction);

    const message = this.messageBusService.createMessage('transactions_app.payment.updated', {
      payment: transaction,
    });

    // console.log('message to php', message);

    this.rabbitClient.send({ channel: 'transactions_app.payment.updated', exchange: 'async_events' }, message).subscribe();
  }

  private async runPaymentRpc(transaction, payload, messageIdentifier) {
    return new Promise((resolve, reject) => {
      this.rabbitClient.send(
        { channel: this.messageBusService.getChannelByPaymentType(transaction.type, environment.stub) },
        this.messageBusService.createPaymentMicroMessage(transaction.type, messageIdentifier, payload, environment.stub),
      ).pipe(
        map((m) => this.messageBusService.unwrapRpcMessage(m)),
        // tap((m) => console.log('UNWRAPPED RPC RESPONSE', m)),
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
      console.log('businessPaymentOption', businessPaymentOption);
    } catch (e) {
      throw new Error(`Cannot resolve business payment option: ${e}`);
    }

    dto.credentials = businessPaymentOption.credentials;

    if (transaction.payment_flow_id) {
      dto.payment_flow = await this.getPaymentFlow(transaction.payment_flow_id);
      console.log('payment_flow', dto.payment_flow);
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
