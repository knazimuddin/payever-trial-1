import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { snakeCase } from 'lodash';
import { Observable, of } from 'rxjs';
import { map, tap, timeout, catchError, take } from 'rxjs/operators';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { ActionPayloadDto } from '../dto';
import { RabbitRoutingKeys } from '../../enums';
import { TransactionsService, MessagingService } from '../services';
import { environment } from '../../environments';

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
  async onActionMigrateEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('ACTION.MIGRATE!', data.payment);
    const transaction: any = data.payment;
    this.transactionsService.prepareTransactionForInsert(transaction);
    this.transactionsService.createOrUpdate(transaction);
  }

}
