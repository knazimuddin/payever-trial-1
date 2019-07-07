import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessageBusService } from '@pe/nest-kit/modules/message';
import { RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { AtomDateConverter, TransactionConverter, TransactionHistoryEntryConverter } from '../converter';
import { CheckoutTransactionInterface } from '../interfaces/checkout';
import { TransactionHistoryEntryInterface, TransactionPackedDetailsInterface } from '../interfaces/transaction';
import { TransactionHistoryEntryModel, TransactionModel } from '../models';
import { StatisticsService, TransactionsService } from '../services';

@Controller()
export class MigrateEventsController {

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
  ) {}

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: RabbitRoutingKeys.PaymentMigrate,
    origin: 'rabbitmq',
  })
  public async onActionMigrateEvent(msg: any): Promise<void> {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    console.log('ACTION.MIGRATE!', data.payment);
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
            (historyItem.created_at && AtomDateConverter.fromAtomFormatToDate(historyItem.created_at)) || new Date(),
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
    console.log('TRANSACTION MIGRATE COMPLETED');
  }

  private async createOrUpdate(transaction: TransactionPackedDetailsInterface): Promise<TransactionModel> {
    if (await this.transactionsService.findModelByUuid(transaction.uuid)) {
      return this.transactionsService.updateByUuid(transaction.uuid, transaction);
    }

    return this.transactionsService.create(transaction);
  }
}
