import { Injectable, HttpService } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, of } from 'rxjs';
import { map, tap, timeout, catchError, take } from 'rxjs/operators';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { RabbitmqClient } from '@pe/nest-kit/modules/rabbitmq';
import { TransactionsService } from '../services/transactions.service';

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
  ) {
    this.rabbitClient = new RabbitmqClient(environment.rabbitmq);
  }

  async getCredentials(transaction: any) {
    if (transaction.channel_set_id) {
      // remove this branch when all transaction.business_option_id will be synced with new DB
      const paymentOptionsList = (await this.httpService.get(`${environment.checkoutMicroUrlBase}api/rest/v1/payment-options`).toPromise()).data as any[];
      const paymentOption = paymentOptionsList.find((po) => po.payment_method === transaction.type);
      const businessPaymentOptions = (await this.httpService.get(`${environment.checkoutMicroUrlBase}api/rest/v1/business-payment-option/channel-set/${transaction.channel_set_id}`).toPromise()).data as any[];
      const businessPaymentOption = businessPaymentOptions.find((bpo) => bpo.payment_option_id === paymentOption.id);
      const paymentMethodData = (await this.httpService.get(`${environment.checkoutMicroUrlBase}api/rest/v1/business-payment-option/${businessPaymentOption.id}`).toPromise()).data;
      return paymentMethodData.credentials;
    } else {
      console.log('check business payment option id', transaction.business_option_id);
      console.log(`${environment.checkoutMicroUrlBase}api/rest/v1/business-payment-option/${transaction.business_option_id}`);
      const paymentMethodData = (await this.httpService.get(`${environment.checkoutMicroUrlBase}api/rest/v1/business-payment-option/${transaction.business_option_id}`).toPromise()).data;
      return paymentMethodData.credentials;
    }
  }

  async getActions(transaction) {
    return new Promise((resolve, reject) => {
      const payload = {
        action: 'action.list',
        data: this.createPayloadData(transaction),
      };

      // return await this.runPaymentRpc(transaction, payload, 'action');

      try {
        const message = this.messageBusService.createPaymentMicroMessage(transaction.type, 'action', payload, !environment.production);
        this.rabbitClient.send(
          { channel: this.messageBusService.getChannelByPaymentType(transaction.type, !environment.production) },
          message,
        ).pipe(
          take(1),
          map((msg) => this.messageBusService.unwrapRpcMessage(msg)),
          tap((msg) => console.log('unwrapped message', msg)),
          map((actions) => {
            return Object.keys(actions).map((key) => ({
              action: key,
              enabled: actions[key],
            }));
          }),
          tap((actions) => console.log('tap', actions)),
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

  async runAction(transaction, action, actionPayload) {
    let credentials;

    console.log('check transaction', transaction);

    try {
      credentials = await this.getCredentials(transaction);
    } catch (e) {
      throw new Error(`could not retrieve credentials: ${e}`);
    }

    const dto = this.createPayloadData(transaction);
    dto.action = action;

    if (actionPayload.fields) {
      dto.fields = this.prepareActionFields(transaction, action, actionPayload.fields);
    }

    if (actionPayload.files) {
      dto.files = actionPayload.files;
    }

    dto.credentials = credentials;

    const payload = {
      action: 'action.do',
      data: dto,
    };

    console.log('RUN ACTION PAYLOAD:', payload.data);

    const updatedTransaction: any = await this.runPaymentRpc(transaction, payload, 'action');
    this.transactionsService.prepareTransactionForInsert(updatedTransaction);
    await this.transactionsService.updateByUuid(updatedTransaction.uuid, updatedTransaction);
  }

  async updateStatus(transaction) {
    let credentials;

    try {
      credentials = await this.getCredentials(transaction);
    } catch (e) {
      throw new Error(`could not retrieve credentials: ${e}`);
    }

    const dto = this.createPayloadData(transaction);

    dto.credentials = credentials;

    const payload = {
      action: 'status',
      data: dto,
    };

    const result: any = await this.runPaymentRpc(transaction, payload, 'payment');

    console.log('UPDATE STATUS RESULT', result);

    const update: any = {};

    if (result.payment.status) {
      update.status = result.payment.status;
    }

    if (result.payment.specific_status) {
      update.specific_status = result.payment.specific_status;
    }

    // const transactionUpdated = {...transaction, status: result.status, specific_status: result.specific_status };
    this.transactionsService.prepareTransactionForInsert(transaction);
    await this.transactionsService.updateByUuid(transaction.uuid, update);
    return transaction;
  }

  private async runPaymentRpc(transaction, payload, messageIdentifier) {
    return new Promise((resolve, reject) => {
      this.rabbitClient.send(
        { channel: this.messageBusService.getChannelByPaymentType(transaction.type, !environment.production) },
        this.messageBusService.createPaymentMicroMessage(transaction.type, messageIdentifier, payload, !environment.production),
      ).pipe(
        map((m) => this.messageBusService.unwrapRpcMessage(m)),
        tap((m) => console.log('UNWRAPPED RPC RESPONSE', m)),
        // tap((reply) => {
          // updating statuses
          // this.transactionsService.prepareTransactionForInsert(transaction);
          // this.transactionsService.update(transaction);
        // }),
        catchError((e) => {
          reject(e);
          return of(null);
        }),
      ).subscribe((reply) => {
        resolve(reply);
      });
    });
  }

  private createPayloadData(transaction: any): any {
    this.fixDates(transaction);
    this.fixId(transaction);
    transaction.address = transaction.billing_address;
    // @TODO this should be done on BE side
    transaction.reference = transaction.uuid;

    try {
      transaction.payment_details = JSON.parse(transaction.payment_details);
    } catch(e) {
      // just skipping payment_details
    }

    return {
      payment: transaction,
      payment_details: transaction.payment_details,
      business: {
        id: 1 // dummy id - php guys say it doesnot affect anything... but can we trust it?)
      },
    };
  }

  private fixDates(transaction) {
    Object.keys(transaction).forEach((key) => {
      if (transaction[key] instanceof Date) {
        // @TODO fix time shift issues
        transaction[key] = transaction[key].toISOString().split('.')[0] + "+00:00";
      }
    });
  }

  private fixId(transaction) {
    transaction.id = transaction.original_id;
  }

  private prepareActionFields(transaction, action: string, fields: any) {
    if (action === 'refund' && fields.payment_return) {
      fields.amount = fields.payment_return.amount || fields['amount'] || 0;
      fields.reason = fields.payment_return.reason || fields['reason'] || null;
      fields.refunded_amount = transaction.amount_refunded;
    }
    return fields;
  }

}
