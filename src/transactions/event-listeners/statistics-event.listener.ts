import { Injectable } from '@nestjs/common';
import { EventListener } from '@pe/nest-kit';
import { PaymentActionEventEnum } from '../enum/events';
import { TransactionModel } from '../models';
import { StatisticsService } from '../services';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';

@Injectable()
export class StatisticsEventListener {
  constructor(
    private readonly statisticsService: StatisticsService,
  ) {}

  @EventListener(PaymentActionEventEnum.PaymentActionCompleted)
  public async handlePaymentCompleted(
    transaction: TransactionModel,
    message: HistoryEventActionCompletedInterface,
  ): Promise<void> {
    await this.statisticsService.processRefundedTransaction(transaction.uuid, message);
  }
}
