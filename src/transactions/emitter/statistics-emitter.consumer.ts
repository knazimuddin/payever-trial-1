import { InjectEventEmitter, NestEventEmitter } from '@pe/nest-kit';
import { PaymentActionEventsEnum } from '../enum/events';
import { TransactionModel } from '../models';
import { StatisticsService } from '../services';
import { AbstractConsumer } from './abstract.consumer';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';
import { EventHandler } from '../decorators/event-handler.decorator';

export class StatisticsEmitterConsumer extends AbstractConsumer {
  constructor(
    @InjectEventEmitter() protected readonly emitter: NestEventEmitter,
    private readonly statisticsService: StatisticsService,
  ) {
    super();
  }

  @EventHandler(PaymentActionEventsEnum.PaymentActionCompleted)
  private async handlePaymentCompleted(
    transaction: TransactionModel,
    message: HistoryEventActionCompletedInterface,
  ): Promise<void> {
    await this.statisticsService.processRefundedTransaction(transaction.uuid, message);
  }
}
