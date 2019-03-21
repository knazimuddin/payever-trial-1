import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { TransactionsService } from '../services';
import { StatisticsService } from '../services/statistics.service';

@Controller()
export class MigrateEventsController {

  private messageBusService: MessageBusService = new MessageBusService({
    rsa: environment.rsa,
  }, this.logger);

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
    const data = this.messageBusService.unwrapMessage<any>(msg.data);
    console.log('ACTION.MIGRATE!', data.payment);
    const transaction: any = data.payment;
    this.transactionsService.prepareTransactionForInsert(transaction);

    if (transaction.items.length) {
      transaction.items = this.transactionsService.prepareTransactionCartForInsert(
        transaction.items,
        transaction.business_uuid,
      );
    }

    const created = await this.transactionsService.createOrUpdate(transaction);
    await this.statisticsService.processMigratedTransaction(created.lean());
    console.log('TRANSACTION MIGRATE COMPLETED');
  }
}
