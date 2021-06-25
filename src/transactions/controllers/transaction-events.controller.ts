import { Controller, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitRoutingKeys, RabbitChannels } from '../../enums';
import { AtomDateConverter, TransactionConverter, TransactionHistoryEntryConverter } from '../converter';
import { TransactionChangedDto, TransactionRemovedDto } from '../dto/checkout-rabbit';
import { CheckoutTransactionInterface } from '../interfaces/checkout';
import { TransactionHistoryEntryInterface, TransactionPackedDetailsInterface } from '../interfaces/transaction';
import { TransactionHistoryEntryModel, TransactionModel } from '../models';
import { PaymentMailEventProducer } from '../producer';
import {
  StatisticsService,
  TransactionHistoryService,
  TransactionsExampleService,
  TransactionsService,
} from '../services';
import { PaymentStatusesEnum } from '../enum';
import { ActionCompletedMessageDto, AddHistoryEventMessageDto } from '../dto/payment-micro';
import { PaymentActionEventEnum } from '../enum/events';
import { EventDispatcher } from '@pe/nest-kit';

@Controller()
export class TransactionEventsController implements OnModuleInit {
  protected transactionsService: TransactionsService;

  constructor(
    protected moduleRef: ModuleRef,
    private readonly historyService: TransactionHistoryService,
    private readonly statisticsService: StatisticsService,
    private readonly paymentMailEventProducer: PaymentMailEventProducer,
    private readonly exampleService: TransactionsExampleService,
    private readonly eventDispatcher: EventDispatcher,
    private readonly logger: Logger,
  ) { }

  public async onModuleInit(): Promise<void> {
    this.transactionsService = await this.moduleRef.create(TransactionsService);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentCreated,
  })
  public async onTransactionCreateEvent(data: TransactionChangedDto): Promise<void> {
    this.logger.log({ text: 'PAYMENT.CREATE', data });

    const checkoutTransaction: CheckoutTransactionInterface = data.payment;
    const transaction: TransactionPackedDetailsInterface =
      TransactionConverter.fromCheckoutTransaction(checkoutTransaction);

    this.logger.log({ text: 'PAYMENT.CREATE: Prepared transaction', transaction });
    const created: TransactionModel = await this.transactionsService.create(transaction);
    this.logger.log({ text: 'PAYMENT.CREATE: Created transaction', transaction: created.toObject() });

    await this.exampleService.removeBusinessExamples(created.business_uuid);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentUpdated,
  })
  public async onTransactionUpdateEvent(data: TransactionChangedDto): Promise<void> {
    this.logger.log({ text: 'PAYMENT.UPDATE', data });

    const checkoutTransaction: CheckoutTransactionInterface = data.payment;
    const transaction: TransactionPackedDetailsInterface =
      TransactionConverter.fromCheckoutTransaction(checkoutTransaction);

    this.logger.log({ text: 'PAYMENT.UPDATE: Prepared transaction', transaction });
    await this.statisticsService.processAcceptedTransaction(transaction.uuid, transaction);
    if (transaction.status === PaymentStatusesEnum.Paid) {
      await this.statisticsService.processPaidTransaction(transaction.uuid, transaction);
    }
    if ((transaction.status === PaymentStatusesEnum.Refunded)
      || (transaction.status === PaymentStatusesEnum.Cancelled)) {
      await this.statisticsService.processRefundedTransactionAfterPaid(transaction.uuid, transaction);
    }
    const updated: TransactionModel = await this.transactionsService.updateByUuid(transaction.uuid, transaction);
    this.logger.log({ text: 'PAYMENT.UPDATE: Updated transaction', transaction: updated.toObject() });
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentRemoved,
  })
  public async onTransactionRemoveEvent(data: TransactionRemovedDto): Promise<void> {
    this.logger.log({ text: 'PAYMENT.REMOVE: Prepared transaction', data });

    return this.transactionsService.removeByUuid(data.payment.uuid);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentSubmitted,
  })
  public async onTransactionSubmittedEvent(data: TransactionChangedDto): Promise<void> {
    this.logger.log(data, 'PAYMENT.SUBMIT');

    return this.paymentMailEventProducer.produceOrderInvoiceEvent(data);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentMigrate,
  })
  public async onTransactionMigrateEvent(data: TransactionChangedDto): Promise<void> {
    this.logger.log({ text: 'PAYMENT.MIGRATE!', data });
    const checkoutTransaction: CheckoutTransactionInterface = data.payment;
    const transaction: TransactionPackedDetailsInterface =
      TransactionConverter.fromCheckoutTransaction(checkoutTransaction);

    const created: TransactionModel = await this.createOrUpdate(transaction);

    const history: TransactionHistoryEntryModel[] = [];

    if (checkoutTransaction.history && checkoutTransaction.history.length) {
      for (const historyItem of checkoutTransaction.history) {
        const record: TransactionHistoryEntryInterface =
          TransactionHistoryEntryConverter.fromCheckoutTransactionHistoryItem(
            historyItem.action,
            (
              historyItem.created_at && AtomDateConverter.fromAtomFormatToDate(historyItem.created_at)
            ) || new Date(),
            historyItem,
          );

        history.push(
          created.history.create(record),
        );
      }
    }

    const createdWithHistory: TransactionModel =
      await this.transactionsService.updateHistoryByUuid(created.uuid, history);

    await this.statisticsService.processMigratedTransaction(createdWithHistory);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentActionCompleted,
  })
  public async onActionCompletedEvent(
    message: ActionCompletedMessageDto,
  ): Promise<void> {
    this.logger.log({ text: 'ACTION.COMPLETED', message });
    const search: { [key: string]: string } = message.payment.uuid
      ? { uuid: message.payment.uuid }
      : { original_id: message.payment.id }
    ;

    this.logger.log({ text: 'ACTION.COMPLETED Search Params', searchParams: search });
    const transaction: TransactionModel = await this.transactionsService.findModelByParams(search);
    if (!transaction) {
      this.logger.warn({ text: 'ACTION.COMPLETED: Transaction is not found', data: message.payment });

      return;
    }

    this.logger.log({ text: 'ACTION.COMPLETED: Transaction found', transaction });

    await this.eventDispatcher.dispatch(
      PaymentActionEventEnum.PaymentActionCompleted,
      transaction,
      message,
    );
    this.logger.log({ text: 'ACTION.COMPLETED: Saved', transaction });
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentHistoryAdd,
  })
  public async onHistoryAddEvent(
    message: AddHistoryEventMessageDto,
  ): Promise<void> {
    this.logger.log({ text: 'HISTORY.ADD', message });
    // @TODO use only uuid later, no original_id
    const search: { [key: string]: string } = message.payment.uuid
      ? { uuid: message.payment.uuid }
      : { original_id: message.payment.id }
    ;

    this.logger.log({ text: 'HISTORY.ADD Search Params', searchParams: search });
    const transaction: TransactionModel = await this.transactionsService.findModelByParams(search);
    if (!transaction) {
      this.logger.warn({ text: 'HISTORY.ADD: Transaction is not found', data: message.payment });

      return;
    }

    this.logger.log({ text: 'HISTORY.ADD: Transaction found', transaction });
    await this.historyService.processHistoryRecord(
      transaction,
      message.history_type,
      new Date(),
      message.data,
    );
    this.logger.log({ text: 'HISTORY.ADD: Saved', transaction });
  }

  private async createOrUpdate(transaction: TransactionPackedDetailsInterface): Promise<TransactionModel> {
    if (await this.transactionsService.findModelByUuid(transaction.uuid)) {
      return this.transactionsService.updateByUuid(transaction.uuid, transaction);
    }

    return this.transactionsService.create(transaction);
  }
}
