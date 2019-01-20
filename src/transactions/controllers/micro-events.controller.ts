import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { snakeCase } from 'lodash';
import { RabbitChannels, RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';

import { BusinessPaymentOptionService, PaymentFlowService, TransactionsService } from '../services';
import { StatisticsService } from '../services/statistics.service';

@Controller()
export class MicroEventsController {

  private messageBusService: MessageBusService = new MessageBusService({
    rsa: environment.rsa,
  });

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly bpoService: BusinessPaymentOptionService,
    private readonly flowService: PaymentFlowService,
    private readonly statisticsService: StatisticsService,
  ) {}

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentActionCompleted,
    origin: 'rabbitmq',
  })
  public async onActionCompletedEvent(msg: any) {
    const data: any = this.messageBusService.unwrapMessage(msg.data);
    console.log('ACTION.COMPLETED', data);
    const searchParams = data.payment.uuid ? {uuid: data.payment.uuid} : {original_id: data.payment.id};
    const transaction = await this.transactionsService.findOneByParams(searchParams);
    // TODO use message bus message created time
    const historyItem = this.transactionsService.prepareTransactionHistoryItemForInsert(data.action, Date.now(), data);
    transaction.history = transaction.history || [];
    transaction.history.push(historyItem);
    await this.statisticsService.processRefundedTransaction(transaction.uuid, data);

    return this.transactionsService.updateByUuid(transaction.uuid, Object.assign({}, transaction, data.payment));
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentHistoryAdd,
    origin: 'rabbitmq',
  })
  public async onHistoryAddEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('HISTORY.ADD', data);
    // @TODO use only uuid later, no original_id
    const searchParams = data.payment.uuid ? {uuid: data.payment.uuid} : {original_id: data.payment.id};
    const transaction = await this.transactionsService.findOneByParams(searchParams);
    // TODO use message bus message created time
    const historyItem = this.transactionsService.prepareTransactionHistoryItemForInsert(
      data.history_type,
      Date.now(),
      data,
    );
    transaction.history = transaction.history || [];
    transaction.history.push(historyItem);

    return this.transactionsService.updateByUuid(transaction.uuid, transaction);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentCreated,
    origin: 'rabbitmq',
  })
  public async onTransactionCreateEvent(msg: any) {
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
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentUpdated,
    origin: 'rabbitmq',
  })
  public async onTransactionUpdateEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('PAYMENT.UPDATE', data);

    const transaction: any = data.payment;
    this.transactionsService.prepareTransactionForInsert(transaction);
    await this.statisticsService.processAcceptedTransaction(transaction.uuid, transaction);
    await this.transactionsService.updateByUuid(transaction.uuid, transaction);
    console.log('TRANSACTION UPDATE COMPLETED');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentRemoved,
    origin: 'rabbitmq',
  })
  public async onTransactionRemoveEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('PAYMENT.REMOVE', data);

    return this.transactionsService.removeByUuid(data.payment.uuid);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.BpoCreated,
    origin: 'rabbitmq',
  })
  public async onBpoCreatedEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    const business_payment_option = data.business_payment_option;
    console.log('BPO.CREATE', data);
    const bpo: any = {
      _id: data.business_payment_option.uuid,
      ...business_payment_option,
    };
    await this.bpoService.createOrUpdate(bpo);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.BpoUpdated,
    origin: 'rabbitmq',
  })
  public async onBpoUpdatedEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('BPO.UPDATE', data);
    const bpo: any = data.business_payment_option;
    await this.bpoService.createOrUpdate(bpo);
    console.log('BPO.UPDATE COMPLETED');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowCreated,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowCreatedEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('FLOW.CREATE', data);
    const flow: any = data.flow;
    await this.flowService.createOrUpdate(flow);
    console.log('FLOW.CREATE COMPLETED');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowMigrate,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowMigrateEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('FLOW.MIGRATE', data);
    const flow: any = data.flow;
    await this.flowService.createOrUpdate(flow);
    console.log('FLOW.MIGRATE COMPLETED');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowUpdated,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowUpdatedEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('FLOW.UPDATE', data);
    const flow: any = data.flow;
    await this.flowService.createOrUpdate(flow);
    console.log('FLOW.UPDATE COMPLETED');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowRemoved,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowRemovedEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('FLOW.REMOVE', data);
    const flow: any = data.flow;
    await this.flowService.removeById(flow.id);
    console.log('FLOW.REMOVE COMPLETED');
  }
}
