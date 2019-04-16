import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { RabbitChannels, RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { CheckoutTransactionInterface, TransactionInterface } from '../interfaces';
import { TransactionModel } from '../models';
import { BusinessPaymentOptionService, PaymentFlowService, StatisticsService, TransactionsService } from '../services';

@Controller()
export class MicroEventsController {
  private messageBusService: MessageBusService = new MessageBusService(
    {
      rsa: environment.rsa,
    },
    this.logger,
  );

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly bpoService: BusinessPaymentOptionService,
    private readonly flowService: PaymentFlowService,
    private readonly statisticsService: StatisticsService,
    private readonly logger: Logger,
  ) { }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentActionCompleted,
    origin: 'rabbitmq',
  })
  public async onActionCompletedEvent(msg: any): Promise<void> {
    const message: any = this.messageBusService.unwrapMessage<any>(msg.data);
    this.logger.log({ text: 'ACTION.COMPLETED', message });
    const searchParams = message.payment.uuid
      ? { uuid: message.payment.uuid }
      : { original_id: message.payment.id }
    ;

    this.logger.log({ text: 'ACTION.COMPLETED Search Params', searchParams });
    const transaction: TransactionModel = await this.transactionsService.findOneByParams(searchParams);
    if (!transaction) {
      this.logger.warn({ text: 'ACTION.COMPLETED: Transaction is not found', data: message.payment });

      return;
    }

    this.logger.log({ text: 'ACTION.COMPLETED: Transaction found', transaction });
    await this.statisticsService.processRefundedTransaction(transaction.uuid, message);
    await this.transactionsService.updateHistoryByUuid(transaction.uuid, message.history_type, message.data);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentHistoryAdd,
    origin: 'rabbitmq',
  })
  public async onHistoryAddEvent(msg: any): Promise<void> {
    const message: any = this.messageBusService.unwrapMessage<any>(msg.data);
    this.logger.log({ text: 'HISTORY.ADD', message });
    // @TODO use only uuid later, no original_id
    const searchParams = message.payment.uuid
      ? { uuid: message.payment.uuid }
      : { original_id: message.payment.id }
    ;

    this.logger.log({ text: 'HISTORY.ADD Search Params', searchParams });
    const transaction: TransactionModel = await this.transactionsService.findOneByParams(searchParams);
    if (!transaction) {
      this.logger.warn({ text: 'HISTORY.ADD: Transaction is not found', data: message.payment });

      return;
    }

    this.logger.log({ text: 'HISTORY.ADD: Transaction found', transaction });
    await this.transactionsService.updateHistoryByUuid(transaction.uuid, message.history_type, message.data);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentCreated,
    origin: 'rabbitmq',
  })
  public async onTransactionCreateEvent(msg: any): Promise<void> {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    this.logger.log({ text: 'PAYMENT.CREATE', data });

    const checkoutTransaction: CheckoutTransactionInterface = data.payment;
    const transaction: TransactionInterface = this.transactionsService.prepareTransactionForInsert(checkoutTransaction);

    if (checkoutTransaction.items.length) {
      transaction.items = this.transactionsService.prepareTransactionCartForInsert(
        checkoutTransaction.items,
        transaction.business_uuid,
      );
    }

    this.logger.log({ text: 'PAYMENT.CREATE: Prepared transaction', transaction });
    const created: TransactionModel = await this.transactionsService.create(transaction);
    this.logger.log({ text: 'PAYMENT.CREATE: Created transaction', transaction: created.toObject() });
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentUpdated,
    origin: 'rabbitmq',
  })
  public async onTransactionUpdateEvent(msg: any): Promise<void> {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    this.logger.log({ text: 'PAYMENT.UPDATE', data });

    const checkoutTransaction: CheckoutTransactionInterface = data.payment;
    const transaction: TransactionInterface = this.transactionsService.prepareTransactionForInsert(checkoutTransaction);

    if (checkoutTransaction.items.length) {
      transaction.items = this.transactionsService.prepareTransactionCartForInsert(
        checkoutTransaction.items,
        transaction.business_uuid,
      );
    }

    this.logger.log({ text: 'PAYMENT.UPDATE: Prepared transaction', transaction });
    await this.statisticsService.processAcceptedTransaction(transaction.uuid, transaction);
    const updated: TransactionModel = await this.transactionsService.updateByUuid(transaction.uuid, transaction);
    this.logger.log({ text: 'PAYMENT.UPDATE: Updated transaction', transaction: updated.toObject() });
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentRemoved,
    origin: 'rabbitmq',
  })
  public async onTransactionRemoveEvent(msg: any): Promise<void> {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    console.log('PAYMENT.REMOVE', data);

    return this.transactionsService.removeByUuid(data.payment.uuid);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.BpoCreated,
    origin: 'rabbitmq',
  })
  public async onBpoCreatedEvent(msg: any): Promise<void> {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    const business_payment_option = data.business_payment_option;
    this.logger.log({ text: 'BPO.CREATE', data });
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
  public async onBpoUpdatedEvent(msg: any): Promise<void> {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    this.logger.log({ text: 'BPO.UPDATE', data });
    const bpo: any = data.business_payment_option;
    await this.bpoService.createOrUpdate(bpo);
    this.logger.log('BPO.UPDATE COMPLETED');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowCreated,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowCreatedEvent(msg: any): Promise<void> {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    this.logger.log({ text: 'FLOW.CREATE', data });
    const flow: any = data.flow;
    await this.flowService.createOrUpdate(flow);
    this.logger.log('FLOW.CREATE COMPLETED');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowMigrate,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowMigrateEvent(msg: any): Promise<void> {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    this.logger.log({ text: 'FLOW.MIGRATE', data });
    const flow: any = data.flow;
    await this.flowService.createOrUpdate(flow);
    this.logger.log('FLOW.MIGRATE COMPLETED');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowUpdated,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowUpdatedEvent(msg: any): Promise<void> {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    this.logger.log({ text: 'FLOW.UPDATE', data });
    const flow: any = data.flow;
    await this.flowService.createOrUpdate(flow);
    this.logger.log('FLOW.UPDATE COMPLETED');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowRemoved,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowRemovedEvent(msg: any): Promise<void> {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    this.logger.log({ text: 'FLOW.REMOVE', data });
    const flow: any = data.flow;
    await this.flowService.removeById(flow.id);
    this.logger.log('FLOW.REMOVE COMPLETED');
  }
}
