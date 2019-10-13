import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitChannels, RabbitRoutingKeys } from '../../enums';
import {
  HistoryEventActionCompletedInterface,
  HistoryEventAddHistoryInterface,
} from '../interfaces/history-event-message';
import { TransactionModel } from '../models';
import { TransactionHistoryService, TransactionsService } from '../services';
import { PaymentActionEventsEnum } from '../enum/events';
import { InjectEventEmitter, NestEventEmitter } from '@pe/nest-kit';

@Controller()
export class HistoryEventsController {
  constructor(
    private readonly transactionService: TransactionsService,
    private readonly historyService: TransactionHistoryService,
    private readonly logger: Logger,
    @InjectEventEmitter() private readonly emitter: NestEventEmitter,
  ) {}

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentActionCompleted,
    origin: 'rabbitmq',
  })
  public async onActionCompletedEvent(
    message: HistoryEventActionCompletedInterface,
  ): Promise<void> {
    this.logger.log({ text: 'ACTION.COMPLETED', message });
    const search: { [key: string]: string } = message.payment.uuid
      ? { uuid: message.payment.uuid }
      : { original_id: message.payment.id }
    ;

    this.logger.log({ text: 'ACTION.COMPLETED Search Params', searchParams: search });
    const transaction: TransactionModel = await this.transactionService.findModelByParams(search);
    if (!transaction) {
      this.logger.warn({ text: 'ACTION.COMPLETED: Transaction is not found', data: message.payment });

      return;
    }

    this.logger.log({ text: 'ACTION.COMPLETED: Transaction found', transaction });

    this.emitter.emit(
      PaymentActionEventsEnum.PaymentActionCompleted,
      transaction,
      message,
    );
    this.logger.log({ text: 'ACTION.COMPLETED: Saved', transaction });
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentHistoryAdd,
    origin: 'rabbitmq',
  })
  public async onHistoryAddEvent(
    message: HistoryEventAddHistoryInterface,
  ): Promise<void> {
    this.logger.log({ text: 'HISTORY.ADD', message });
    // @TODO use only uuid later, no original_id
    const search: { [key: string]: string } = message.payment.uuid
      ? { uuid: message.payment.uuid }
      : { original_id: message.payment.id }
    ;

    this.logger.log({ text: 'HISTORY.ADD Search Params', searchParams: search });
    const transaction: TransactionModel = await this.transactionService.findModelByParams(search);
    if (!transaction) {
      this.logger.warn({ text: 'HISTORY.ADD: Transaction is not found', data: message.payment });

      return;
    }

    this.logger.log({ text: 'HISTORY.ADD: Transaction found', transaction });
    await this.historyService.processHistoryRecord(
      transaction,
      message.history_type,
      new Date(),
      message.data,
    );
    this.logger.log({ text: 'HISTORY.ADD: Saved', transaction });
  }
}
