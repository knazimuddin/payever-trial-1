import { Injectable } from '@nestjs/common';
import { PaymentActionEventsEnum } from '../enum/events';
import { TransactionModel } from '../models';
import { StatisticsService } from '../services';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';
import { EventHandler } from '../decorators/event-handler.decorator';

@Injectable()
export class StatisticsEventListener {
  constructor(
    private readonly statisticsService: StatisticsService,
  ) {}

  @EventHandler(PaymentActionEventsEnum.PaymentActionCompleted)
  public async handlePaymentCompleted(
    transaction: TransactionModel,
    message: HistoryEventActionCompletedInterface,
  ): Promise<void> {
    await this.statisticsService.processRefundedTransaction(transaction.uuid, message);
  }
}
