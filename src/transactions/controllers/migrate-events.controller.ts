import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { CheckoutTransactionInterface, TransactionInterface } from '../interfaces';
import { TransactionModel } from '../models';
import { StatisticsService, TransactionsService } from '../services';

@Controller()
export class MigrateEventsController {

  private messageBusService: MessageBusService = new MessageBusService({
    rsa: environment.rsa,
  });

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly statisticsService: StatisticsService,
  ) {}

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: RabbitRoutingKeys.PaymentMigrate,
    origin: 'rabbitmq',
  })
  public async onActionMigrateEvent(msg: any) {
    const data: any = this.messageBusService.unwrapMessage(msg.data);
    console.log('ACTION.MIGRATE!', data.payment);
    const checkoutTransaction: CheckoutTransactionInterface = data.payment;
    const transaction: TransactionInterface = this.transactionsService.prepareTransactionForInsert(checkoutTransaction);

    if (checkoutTransaction.items.length) {
      transaction.items = this.transactionsService.prepareTransactionCartForInsert(
        checkoutTransaction.items,
        transaction.business_uuid,
      );
    }

    const created: TransactionModel = await this.createOrUpdate(transaction);
    await this.statisticsService.processMigratedTransaction(created);
    console.log('TRANSACTION MIGRATE COMPLETED');
  }

  private async createOrUpdate(transaction: TransactionInterface) {
    if (await this.transactionsService.findOneByUuid( transaction.uuid )) {
      return this.transactionsService.updateByUuid(transaction.uuid, transaction);
    }

    return this.transactionsService.create(transaction);
  }
}
