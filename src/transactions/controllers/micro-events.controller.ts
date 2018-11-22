import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { snakeCase } from 'lodash';
import { Observable, of } from 'rxjs';
import { map, tap, timeout, catchError, take } from 'rxjs/operators';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { ActionPayloadDto } from '../dto';

import {
  BusinessPaymentOptionService,
  MessagingService,
  PaymentFlowService,
  TransactionsService,
} from '../services';
import { environment } from '../../environments';
import { RabbitRoutingKeys } from '../../enums';

@Controller()
export class MicroEventsController {

  private messageBusService: MessageBusService = new MessageBusService({
    rsa: environment.rsa,
  });

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly bpoService: BusinessPaymentOptionService,
    private readonly flowService: PaymentFlowService,
  ) {
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: RabbitRoutingKeys.PaymentActionCompleted,
    origin: 'rabbitmq',
  })
  async onActionCompletedEvent(msg: any) {
    const data: any = this.messageBusService.unwrapMessage(msg.data);
    console.log('ACTION.COMPLETED', data);
    const searchParams = data.payment.uuid ? {uuid: data.payment.uuid} : {original_id: data.payment.id};
    const transaction = await this.transactionsService.findOneByParams(searchParams);
    // TODO use message bus message created time
    const historyItem = this.transactionsService.prepareTransactionHistoryItemForInsert(data.action, Date.now(), data);
    transaction.history = transaction.history || [];
    transaction.history.push(historyItem);
    return await this.transactionsService.updateByUuid(transaction.uuid, Object.assign({}, transaction, data.payment));
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: RabbitRoutingKeys.PaymentHistoryAdd,
    origin: 'rabbitmq',
  })
  async onHistoryAddEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('HISTORY.ADD', data);
    // @TODO use only uuid later, no original_id
    const searchParams = data.payment.uuid ? {uuid: data.payment.uuid} : {original_id: data.payment.id};
    const transaction = await this.transactionsService.findOneByParams(searchParams);
    // TODO use message bus message created time
    const historyItem = this.transactionsService.prepareTransactionHistoryItemForInsert(data.history_type, Date.now(), data);
    transaction.history = transaction.history || [];
    transaction.history.push(historyItem);
    return await this.transactionsService.updateByUuid(transaction.uuid, transaction);
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: RabbitRoutingKeys.PaymentCreated,
    origin: 'rabbitmq',
  })
  async onTransactionCreateEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('PAYMENT.CREATE', data);
    const transaction: any = data.payment;
    this.transactionsService.prepareTransactionForInsert(transaction);

    if (data.payment.id) {
      transaction.original_id = data.payment.id;
    }

    await this.transactionsService.create(transaction);
    console.log('TRANSACTION CREATE COMPLETED');
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: RabbitRoutingKeys.PaymentUpdated,
    origin: 'rabbitmq',
  })
  async onTransactionUpdateEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('PAYMENT.UPDATE', data);

    const transaction: any = data.payment;
    this.transactionsService.prepareTransactionForInsert(transaction);
    await this.transactionsService.updateByUuid(transaction.uuid, transaction);
    console.log('TRANSACTION UPDATE COMPLETED');
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: RabbitRoutingKeys.PaymentRemoved,
    origin: 'rabbitmq',
  })
  async onTransactionRemoveEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('PAYMENT.REMOVE', data);
    return await this.transactionsService.removeByUuid(data.payment.uuid);
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: RabbitRoutingKeys.BpoCreated,
    origin: 'rabbitmq',
  })
  async onBpoCreatedEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('BPO.CREATE', data);
    const bpo: any = data.business_payment_option;
    await this.bpoService.createOrUpdate(bpo);
    // remove debug count!
    const count = await this.bpoService.count();
    console.log(`BPO.CREATE COMPLETED, total: ${count}`);
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: RabbitRoutingKeys.BpoUpdated,
    origin: 'rabbitmq',
  })
  async onBpoUpdatedEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('BPO.UPDATE', data);
    const bpo: any = data.business_payment_option;
    await this.bpoService.createOrUpdate(bpo);
    console.log('BPO.UPDATE COMPLETED');
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: RabbitRoutingKeys.PaymentFlowCreated,
    origin: 'rabbitmq',
  })
  async onPaymentFlowCreatedEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('FLOW.CREATE', data);
    const flow: any = data.flow;
    await this.bpoService.createOrUpdate(flow);
    console.log('FLOW.CREATE COMPLETED');
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: RabbitRoutingKeys.PaymentFlowUpdated,
    origin: 'rabbitmq',
  })
  async onPaymentFlowUpdatedEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('FLOW.UPDATE', data);
    const flow: any = data.flow;
    await this.bpoService.createOrUpdate(flow);
    console.log('FLOW.UPDATE COMPLETED');
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: RabbitRoutingKeys.PaymentFlowRemoved,
    origin: 'rabbitmq',
  })
  async onPaymentFlowRemovedEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('FLOW.REMOVE', data);
    const flow: any = data.flow;
    await this.bpoService.removeById(flow.id);
    console.log('FLOW.REMOVE COMPLETED');
  }

}
