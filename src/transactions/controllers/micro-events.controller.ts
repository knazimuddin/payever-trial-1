import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { snakeCase } from 'lodash';
import { Observable, of } from 'rxjs';
import { map, tap, timeout, catchError, take } from 'rxjs/operators';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { ActionPayloadDto } from '../dto';

import { TransactionsService, MessagingService } from '../services';
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
    const data: any = this.messageBusService.unwrapMessage(msg.data);
    console.log('ACTION.COMPLETED', data);
    const searchParams = data.payment.uuid ? {uuid: data.payment.uuid} : {original_id: data.payment.id};
    const transaction = await this.transactionsService.findOneByParams(searchParams);
    // TODO use message bus message created time
    const historyItem = this.transactionsService.prepareTransactionHistoryItemForInsert(data.action, Date.now(), data);
    transaction.history = transaction.history || [];
    transaction.history.push(historyItem);
    return await this.transactionsService.updateByUuid(transaction.uuid, Object.assign({}, transaction, data.payment));
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: 'payever.microservice.payment.history.add',
    origin: 'rabbitmq',
  })
  async onHistoryAddEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('HISTORY.ADD', data);
    // @TODO use only uuid later, no original_id
    const searchParams = data.payment.uuid ? {uuid: data.payment.uuid} : {original_id: data.payment.id};
    const transaction = await this.transactionsService.findOneByParams(searchParams);
    // TODO use message bus message created time
    const historyItem = this.transactionsService.prepareTransactionHistoryItemForInsert(data.history_type, Date.now(), data);
    transaction.history = transaction.history || [];
    transaction.history.push(historyItem);
    return await this.transactionsService.updateByUuid(transaction.uuid, transaction);
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
    this.transactionsService.prepareTransactionForInsert(transaction);

    if (data.payment.id) {
      transaction.original_id = data.payment.id;
    }

    await this.transactionsService.create(transaction);
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: 'payever.event.payment.removed',
    origin: 'rabbitmq',
  })
  async onTransactionRemoveEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('PAYMENT.REMOVE', data);
    return await this.transactionsService.removeByUuid(data.payment.uuid);
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
    this.transactionsService.prepareTransactionForInsert(transaction);
    return await this.transactionsService.updateByUuid(transaction.uuid, transaction);
  }

}
