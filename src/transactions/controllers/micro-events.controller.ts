import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { snakeCase } from 'lodash';
import { Observable, of } from 'rxjs';
import { map, tap, timeout, catchError, take } from 'rxjs/operators';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { ActionPayloadDto } from '../dto';

import { TransactionsService, MicroRoutingService, MessagingService } from '../services';
import { environment } from '../../environments';

@Controller()
export class MicroEventsController {

  private messageBusService: MessageBusService = new MessageBusService({
    rsa: environment.rsa,
  });

  constructor(private readonly transactionsService: TransactionsService) {
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: 'payever.event.payment.action.completed',
    origin: 'rabbitmq',
  })
  async onActionCompletedEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('ACTION.COMPLETED', data);
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: 'payever.microservice.payment.history.add',
    origin: 'rabbitmq',
  })
  async onHistoryAddEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('HISTORY.ADD', data);

    const transaction = await this.transactionsService.findOneByParams({ original_id: data.payment.id });

    const historyItem = this.preparePhpTransactionHistoryItemForInsert(data);
    transaction.history = transaction.history || [];
    transaction.history.push(historyItem);
    return await this.transactionsService.update(transaction);
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: 'payever.event.payment.created',
    origin: 'rabbitmq',
  })
  async onTransactionCreateEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('PAYMENT.CREATE', data);

    const transaction: any = data.payment;
    this.preparePhpTransactionForInsert(transaction);
    this.transactionsService.create(transaction);
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: 'payever.event.payment.removed',
    origin: 'rabbitmq',
  })
  async onTransactionRemoveEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('PAYMENT.REMOVE', data);
    this.transactionsService.removeByUuid(data.uuid);
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: 'payever.event.payment.updated',
    origin: 'rabbitmq',
  })
  async onTransactionUpdateEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('PAYMENT.UPDATE', data);

    const transaction: any = data.payment;
    this.preparePhpTransactionForInsert(transaction);
    this.transactionsService.update(transaction);
  }

  private preparePhpTransactionForInsert(transaction) {
    transaction.billing_address = transaction.address;
    transaction.original_id = transaction.id;
    transaction.business_uuid = transaction.business.uuid;
    transaction.type = transaction.payment_type;
    transaction.payment_details = JSON.stringify(transaction.payment_details);
  }

  private preparePhpTransactionHistoryItemForInsert(data) {
    return {
      ...data.data,
      action: data.history_type,
      created_at: Date.now(),
    };
  }

}
