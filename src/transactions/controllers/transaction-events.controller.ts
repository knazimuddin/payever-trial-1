import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitRoutingKeys, RabbitChannels } from '../../enums';
import { TransactionConverter } from '../converter';
import { TransactionChangedDto, TransactionRemovedDto } from '../dto/checkout-rabbit';
import { CheckoutTransactionInterface } from '../interfaces/checkout';
import { TransactionPackedDetailsInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { PaymentMailEventProducer } from '../producer';
import { StatisticsService, TransactionsExampleService, TransactionsService } from '../services';
import { PaymentStatusesEnum } from '../enum';
import { plainToClass } from 'class-transformer';

@Controller()
export class TransactionEventsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly statisticsService: StatisticsService,
    private readonly paymentMailEventProducer: PaymentMailEventProducer,
    private readonly exampleService: TransactionsExampleService,
    private readonly logger: Logger,
  ) { }

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
  public async onTransactionUpdateEvent(data: any): Promise<void> {
    this.logger.log({ text: 'PAYMENT.UPDATE', data });
    const transactionChangedDto: TransactionChangedDto = plainToClass(TransactionChangedDto, data);
    console.log('PaymentUpdated transactionChangedDto', transactionChangedDto);

    const checkoutTransaction: CheckoutTransactionInterface = transactionChangedDto.payment;
    const transaction: TransactionPackedDetailsInterface =
      TransactionConverter.fromCheckoutTransaction(checkoutTransaction);
    console.log('PaymentUpdated checkoutTransaction', transaction.refunded_items);

    this.logger.log({ text: 'PAYMENT.UPDATE: Prepared transaction', transaction });
    await this.statisticsService.processAcceptedTransaction(transaction.uuid, transaction);
    if (transaction.status === PaymentStatusesEnum.Paid) {
      await this.statisticsService.processPaidTransaction(transaction.uuid, transaction);
    }
    if ((transaction.status === PaymentStatusesEnum.Refunded)
      || (transaction.status === PaymentStatusesEnum.Cancelled)) {
      await this.statisticsService.processRefundedTransactionAfterPaid(transaction.uuid, transaction);
    }

    console.log('PaymentUpdated transaction', transaction.refunded_items);
    const updated: TransactionModel = await this.transactionsService.updateByUuid(transaction.uuid, transaction);
    console.log('PaymentUpdated updated', updated.refunded_items);

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
}
