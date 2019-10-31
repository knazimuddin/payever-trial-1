import { Injectable } from '@nestjs/common';
import { PaymentActionEventsEnum } from '../enum/events';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';
import { TransactionModel } from '../models';
import { TransactionHistoryService } from '../services';
import { EventHandler } from '../decorators/event-handler.decorator';

@Injectable()
export class HistoryRecordEventListener {
  constructor(
    private readonly historyService: TransactionHistoryService,
  ) {}

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
