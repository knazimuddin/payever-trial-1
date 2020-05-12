import { Injectable } from '@nestjs/common';
import { EventListener } from '@pe/nest-kit';
import { PaymentActionEventEnum } from '../enum/events';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';
import { TransactionModel } from '../models';
import { TransactionHistoryService } from '../services';

@Injectable()
export class HistoryRecordEventListener {
  constructor(
    private readonly historyService: TransactionHistoryService,
  ) { }

  @EventListener(PaymentActionEventEnum.PaymentActionCompleted)
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
