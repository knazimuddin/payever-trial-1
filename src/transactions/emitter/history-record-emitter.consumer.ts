import { InjectEventEmitter, NestEventEmitter, TypedMessageInterface } from '@pe/nest-kit';
import { PaymentActionEventsEnum } from '../enum/events';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';
import { TransactionModel } from '../models';
import { TransactionHistoryService } from '../services';
import { AtomDateConverter } from '../converter';
import { Injectable } from '@nestjs/common';
import { EventHandler } from '../decorators/event-handler.decorator';
import { AbstractConsumer } from './abstract.consumer';

@Injectable()
export class HistoryRecordEmitterConsumer extends AbstractConsumer {

  constructor(
    @InjectEventEmitter() protected readonly emitter: NestEventEmitter,
    private readonly historyService: TransactionHistoryService,
  ) {
    super();
  }

  @EventHandler(PaymentActionEventsEnum.PaymentActionCompleted)
  public async handlePaymentCompleted(
    transaction: TransactionModel,
    message: HistoryEventActionCompletedInterface,
  ): Promise<void> {
    await this.historyService.processHistoryRecord(
      transaction,
      message.action,
      new Date(),
      message.data,
    );
  }
}
