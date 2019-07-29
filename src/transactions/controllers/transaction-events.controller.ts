import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessageBusService } from '@pe/nest-kit/modules/message';
import { RabbitChannels, RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { TransactionConverter } from '../converter';
import { PaymentSubmittedDto } from '../dto';
import { CheckoutTransactionInterface } from '../interfaces/checkout';
import { TransactionPackedDetailsInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { PaymentMailEventProducer } from '../producer';
import { StatisticsService, TransactionsService } from '../services';

@Controller()
export class TransactionEventsController {
  private messageBusService: MessageBusService = new MessageBusService(
    {
      rsa: environment.rsa,
    },
    this.logger,
  );

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly statisticsService: StatisticsService,
    private readonly logger: Logger,
    private readonly paymentMailEventProducer: PaymentMailEventProducer,
  ) { }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentCreated,
    origin: 'rabbitmq',
  })
  public async onTransactionCreateEvent(msg: any): Promise<void> {
    const data: { payment: CheckoutTransactionInterface } =
      this.messageBusService.unwrapMessage<{ payment: CheckoutTransactionInterface }>(msg.data);
    this.logger.log({ text: 'PAYMENT.CREATE', data });

    const checkoutTransaction: CheckoutTransactionInterface = data.payment;
    const transaction: TransactionPackedDetailsInterface =
      TransactionConverter.fromCheckoutTransaction(checkoutTransaction);

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
    const data: { payment: CheckoutTransactionInterface } =
      this.messageBusService.unwrapMessage<{ payment: CheckoutTransactionInterface }>(msg.data);
    this.logger.log({ text: 'PAYMENT.UPDATE', data });

    const checkoutTransaction: CheckoutTransactionInterface = data.payment;
    const transaction: TransactionPackedDetailsInterface =
      TransactionConverter.fromCheckoutTransaction(checkoutTransaction);

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
    const data: { payment: CheckoutTransactionInterface } =
      this.messageBusService.unwrapMessage<{ payment: CheckoutTransactionInterface }>(msg.data);
    this.logger.log({ text: 'PAYMENT.REMOVE: Prepared transaction', data });

    return this.transactionsService.removeByUuid(data.payment.uuid);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentSubmitted,
    origin: 'rabbitmq',
  })
  public async onTransactionSubmittedEvent(msg: any): Promise<void> {
    const data: PaymentSubmittedDto = this.messageBusService.unwrapMessage<PaymentSubmittedDto>(msg.data);
    this.logger.log(data, 'PAYMENT.SUBMIT');

    return this.paymentMailEventProducer.produceOrderInvoiceEvent(data);
  }
}
