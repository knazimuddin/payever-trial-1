import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { TransactionsService } from '../services';

@Controller()
export class MigrateEventsController {

  private messageBusService: MessageBusService = new MessageBusService({
    rsa: environment.rsa,
  });

  constructor(private readonly transactionsService: TransactionsService) {
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: RabbitRoutingKeys.PaymentMigrate,
    origin: 'rabbitmq',
  })
  public async onActionMigrateEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('ACTION.MIGRATE!', data.payment);
    const transaction: any = data.payment;
    this.transactionsService.prepareTransactionForInsert(transaction);

    if (data.payment.id) {
      transaction.original_id = data.payment.id;
    }

    await this.transactionsService.createOrUpdate(transaction);
    console.log('TRANSACTION MIGRATE COMPLETED');
  }
}
