import { Injectable, Logger } from '@nestjs/common';
import { InjectRabbitMqClient, RabbitMqClient } from '@pe/nest-kit';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { of } from 'rxjs';
import { catchError, map, take, timeout } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { environment } from '../../environments';
import { NextActionDto } from '../dto/next-action.dto';
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
    this.logger);

  private readonly rpcTimeout: number = 30000;

  constructor(
    private readonly logger: Logger,
    private readonly transactionsService: TransactionsService,
    private readonly bpoService: BusinessPaymentOptionService,
    private readonly flowService: PaymentFlowService,
    private readonly paymentMicroService: PaymentsMicroService,
    @InjectRabbitMqClient() private readonly rabbitClient: RabbitMqClient,
  ) {
  }

  public getBusinessPaymentOption(transaction: any) {
    return this.bpoService.findOneById(transaction.business_option_id);
  }

  // Uncomment when payment flow will be retrieved from local projection
  public getPaymentFlow(flowId: string) {
    return this.flowService.findOne(flowId);
  }

  public async getActions(transaction): Promise<any[]> {
    let payload: any = null;
    try {
      const data = await this.createPayloadData(transaction);
      if (data) {
        payload = {
          action: 'action.list',
          data,
        };
      }
    } catch (error) {
      this.logger.error('Could not prepare payload for actions call:', error);

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

    if (transaction.type === 'santander_installment_dk') {
      actions = actions.filter(x => x.action !== 'edit');
    }

    return actions;
  }

  public async runAction(transaction, action, actionPayload) {
    let payload = null;

    try {
      const dto = await this.createPayloadData(transaction);
      if (dto) {
        if (action === 'capture' && actionPayload.fields.capture_funds) {
          dto.payment.amount = actionPayload.fields.capture_funds.amount;
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
    const updatedTransaction: any = Object.assign({}, transaction, rpcResult.payment);
    this.logger.log('RPC result: ', updatedTransaction);
    updatedTransaction.payment_details = this.checkRPCResponsePropertyExists(rpcResult.payment_details)
      ? rpcResult.payment_details : transaction.payment_details;
    updatedTransaction.items = rpcResult.payment_items && rpcResult.payment_items.length
      ? rpcResult.payment_items : transaction.items;
    this.logger.log('Updated transaction: ', updatedTransaction);
    // We do not update history here.
    // History events coming separately, there is a chance to overwrite saved history here
    delete updatedTransaction.history;
    this.transactionsService.prepareTransactionForInsert(updatedTransaction);
    await this.transactionsService.updateByUuid(updatedTransaction.uuid, updatedTransaction);

    if (rpcResult && rpcResult.next_action) {
      await this.runNextAction(updatedTransaction, rpcResult.next_action);
    }

    return updatedTransaction;
  }

  public async runNextAction(transaction, nextAction: NextActionDto) {
    switch (nextAction.type) {
      case 'action':
        // stub for action behaviour
        break;
      case 'external_capture':
        await this.externalCapture(nextAction.payment_method, nextAction.payload);
        break;
    }
  }

  public async updateStatus(transaction) {
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
    const rpcPayment: any = rpcResult.payment;

    const updatedTransaction: any = Object.assign(
      {},
      transaction,
      {
        place: rpcPayment.place,
        status: rpcPayment.status ? rpcPayment.status : transaction.status,
        specific_status: rpcPayment.specific_status ? rpcPayment.specific_status : transaction.specific_status,
        payment_details: rpcResult.payment_details ? rpcResult.payment_details : transaction.payment_details,
      },
    );

    this.transactionsService.prepareTransactionForInsert(updatedTransaction);
    await this.transactionsService.updateByUuid(transaction.uuid, updatedTransaction);

    return transaction;
  }

  public async externalCapture(paymentMethod, payload) {
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

  public async sendTransactionUpdate(transaction) {
    this.transformTransactionForPhp(transaction);
    const payload: any = { payment: transaction };
    this.logger.log(`SEND 'transactions_app.payment.updated', payload:`, payload);
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

  private async createPayloadData(transaction: any) {
    transaction = Object.assign({}, transaction); // making clone before manipulations

    if (typeof (transaction.payment_details) === 'string') {
      try {
        transaction.payment_details = JSON.parse(transaction.payment_details);
      } catch (e) {
        this.logger.log(e);
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

    dto = {
      ...dto,
      payment: transaction,
      payment_details: transaction.payment_details,
      business: {
        id: transaction.business_uuid,
      },
    };

    try {
      businessPaymentOption = await this.getBusinessPaymentOption(transaction);
    } catch (e) {
      throw new Error(`Transaction:${transaction.uuid} -> Cannot resolve business payment option: ${e}`);
    }

    try {
      paymentFlow = await this.getPaymentFlow(transaction.payment_flow_id);
    } catch (e) {
      this.logger.error(`Transaction:${transaction.uuid} -> Cannot resolve payment flow: ${e}`);

      return null;
    }

    if (!paymentFlow) {
      this.logger.error(`Transaction:${transaction.uuid} -> Payment flow cannot be null.`);

      return null;
    }

    dto.credentials = businessPaymentOption.credentials;
    this.logger.log('dto credentials: ' + JSON.stringify(dto.credentials));

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
        this.logger.log(e);
        transaction.payment_details = {};
        // just skipping payment_details
      }
    }
  }

  private checkRPCResponsePropertyExists(prop: any): boolean {
    if (Array.isArray(prop)) {
      return !!prop.length;
    }
    else {
      return !!prop;
    }
  }
}
