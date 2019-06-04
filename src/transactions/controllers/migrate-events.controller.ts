import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessageBusService } from '@pe/nest-kit/modules/message';
import { RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { TransactionConverter, TransactionHistoryEntryConverter } from '../converter';
import { CheckoutTransactionInterface } from '../interfaces/checkout';
import { TransactionPackedDetailsInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';
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
  public async onActionMigrateEvent(msg: any) {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    console.log('ACTION.MIGRATE!', data.payment);
    const checkoutTransaction: CheckoutTransactionInterface = data.payment;
    const transaction: TransactionPackedDetailsInterface =
      TransactionConverter.fromCheckoutTransaction(checkoutTransaction);

    if (checkoutTransaction.history && checkoutTransaction.history.length) {
      for (const historyItem of checkoutTransaction.history) {
        transaction.history.push(
          TransactionHistoryEntryConverter.fromCheckoutTransactionHistoryItem(
            historyItem.action,
            historyItem.created_at,
            historyItem,
          ),
        );
      }
    }

    const created: TransactionModel = await this.createOrUpdate(transaction);
    await this.statisticsService.processMigratedTransaction(created);
    console.log('TRANSACTION MIGRATE COMPLETED');
  }

  private async createOrUpdate(transaction: TransactionPackedDetailsInterface) {
    if (await this.transactionsService.findUnpackedByUuid( transaction.uuid )) {
      return this.transactionsService.updateByUuid(transaction.uuid, transaction);
    }

    return this.transactionsService.create(transaction);
  }
}
