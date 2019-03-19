import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { snakeCase } from 'lodash';

import { RabbitChannels, RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { BusinessPaymentOptionInterface, CheckoutTransactionInterface, TransactionInterface } from '../interfaces';
import { TransactionModel } from '../models';
import { BusinessPaymentOptionService, PaymentFlowService, StatisticsService, TransactionsService } from '../services';

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
  ) { }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentActionCompleted,
    origin: 'rabbitmq',
  })
  public async onActionCompletedEvent(msg: any) {
    const message: any = this.messageBusService.unwrapMessage(msg.data);
    console.log('ACTION.COMPLETED', message);
    const searchParams = message.payment.uuid
      ? { uuid: message.payment.uuid }
      : { original_id: message.payment.id }
    ;
    const transaction: TransactionModel = await this.transactionsService.findOneByParams(searchParams);
    await this.statisticsService.processRefundedTransaction(transaction.uuid, message);

    return this.transactionsService.updateHistoryByUuid(transaction.uuid, message.history_type, message.data);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentHistoryAdd,
    origin: 'rabbitmq',
  })
  public async onHistoryAddEvent(msg: any) {
    const message: any = this.messageBusService.unwrapMessage(msg.data);
    console.log('HISTORY.ADD', message);
    // @TODO use only uuid later, no original_id
    const searchParams = message.payment.uuid
      ? { uuid: message.payment.uuid }
      : { original_id: message.payment.id }
    ;
    const transaction = await this.transactionsService.findOneByParams(searchParams);

    return this.transactionsService.updateHistoryByUuid(transaction.uuid, message.history_type, message.data);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentCreated,
    origin: 'rabbitmq',
  })
  public async onTransactionCreateEvent(msg: any) {
    // due to race conditions create event can income after update, so we react only on update event
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentUpdated,
    origin: 'rabbitmq',
  })
  public async onTransactionUpdateEvent(msg: any) {
    const data: any = this.messageBusService.unwrapMessage(msg.data);

    const checkoutTransaction: CheckoutTransactionInterface = data.payment;
    const transaction: TransactionInterface = this.transactionsService.prepareTransactionForInsert(checkoutTransaction);

    if (checkoutTransaction.items.length) {
      transaction.items = this.transactionsService.prepareTransactionCartForInsert(
        checkoutTransaction.items,
        transaction.business_uuid,
      );
    }

    if (!await this.transactionsService.findOneByUuid(transaction.uuid)) {
      console.log('PAYMENT.CREATE', data);
      await this.transactionsService.create(transaction);
    } else {
      console.log('PAYMENT.UPDATE', data);
      await this.statisticsService.processAcceptedTransaction(transaction.uuid, transaction);
      await this.transactionsService.updateByUuid(transaction.uuid, transaction);
      console.log(`TRANSACTION ${transaction.uuid} UPDATE COMPLETED`);
    }
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentRemoved,
    origin: 'rabbitmq',
  })
  public async onTransactionRemoveEvent(msg: any) {
    const data: any = this.messageBusService.unwrapMessage(msg.data);
    console.log('PAYMENT.REMOVE', data);

    await this.transactionsService.removeByUuid(data.payment.uuid);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.BpoCreated,
    origin: 'rabbitmq',
  })
  public async onBpoCreatedEvent(msg: any) {
    const data: any = this.messageBusService.unwrapMessage(msg.data);
    const businessPaymentOption: BusinessPaymentOptionInterface = data.business_payment_option;
    console.log('BPO.CREATE', data);
    await this.bpoService.createOrUpdate(businessPaymentOption);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.BpoUpdated,
    origin: 'rabbitmq',
  })
  public async onBpoUpdatedEvent(msg: any) {
    const data: any = this.messageBusService.unwrapMessage(msg.data);
    console.log('BPO.UPDATE', data);
    const businessPaymentOption: BusinessPaymentOptionInterface = data.business_payment_option;
    await this.bpoService.createOrUpdate(businessPaymentOption);
    console.log('BPO.UPDATE COMPLETED');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowCreated,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowCreatedEvent(msg: any) {
    const data: any = this.messageBusService.unwrapMessage(msg.data);
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
    const data: any = this.messageBusService.unwrapMessage(msg.data);
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
    const data: any = this.messageBusService.unwrapMessage(msg.data);
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
    const data: any = this.messageBusService.unwrapMessage(msg.data);
    console.log('FLOW.REMOVE', data);
    const flow: any = data.flow;
    await this.flowService.removeById(flow.id);
    console.log('FLOW.REMOVE COMPLETED');
  }
}
