import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { RabbitChannels, RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import {
  HistoryEventActionCompletedInterface,
  HistoryEventAddHistoryInterface,
} from '../interfaces/history-event-message';
import { TransactionModel } from '../models';
import { StatisticsService, TransactionHistoryService, TransactionsService } from '../services';

@Controller()
export class HistoryEventsController {
  private messageBusService: MessageBusService = new MessageBusService(
    {
      rsa: environment.rsa,
    },
    this.logger,
  );

  constructor(
    private readonly transactionService: TransactionsService,
    private readonly historyService: TransactionHistoryService,
    private readonly statisticsService: StatisticsService,
    private readonly logger: Logger,
  ) { }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentActionCompleted,
    origin: 'rabbitmq',
  })
  public async onActionCompletedEvent(msg: any): Promise<void> {
    const message: HistoryEventActionCompletedInterface =
      this.messageBusService.unwrapMessage<HistoryEventActionCompletedInterface>(msg.data);
    this.logger.log({ text: 'ACTION.COMPLETED', message });
    const searchParams = message.payment.uuid
      ? { uuid: message.payment.uuid }
      : { original_id: message.payment.id }
    ;

    this.logger.log({ text: 'ACTION.COMPLETED Search Params', searchParams });
    const transaction: TransactionModel = await this.transactionService.findOneByParams(searchParams);
    if (!transaction) {
      this.logger.warn({ text: 'ACTION.COMPLETED: Transaction is not found', data: message.payment });

      return;
    }

    this.logger.log({ text: 'ACTION.COMPLETED: Transaction found', transaction });
    await this.statisticsService.processRefundedTransaction(transaction.uuid, message);
    await this.historyService.processHistoryRecord(transaction, message.action, new Date(), message.data);
    this.logger.log({ text: 'ACTION.COMPLETED: Saved', transaction });
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentHistoryAdd,
    origin: 'rabbitmq',
  })
  public async onHistoryAddEvent(msg: any): Promise<void> {
    const message: HistoryEventAddHistoryInterface =
      this.messageBusService.unwrapMessage<HistoryEventAddHistoryInterface>(msg.data);
    this.logger.log({ text: 'HISTORY.ADD', message });
    // @TODO use only uuid later, no original_id
    const searchParams = message.payment.uuid
      ? { uuid: message.payment.uuid }
      : { original_id: message.payment.id }
    ;

    this.logger.log({ text: 'HISTORY.ADD Search Params', searchParams });
    const transaction: TransactionModel = await this.transactionService.findOneByParams(searchParams);
    if (!transaction) {
      this.logger.warn({ text: 'HISTORY.ADD: Transaction is not found', data: message.payment });

      return;
    }

    this.logger.log({ text: 'HISTORY.ADD: Transaction found', transaction });
    await this.historyService.processHistoryRecord(transaction, message.history_type, new Date(), message.data);
    this.logger.log({ text: 'HISTORY.ADD: Saved', transaction });
  }
}
