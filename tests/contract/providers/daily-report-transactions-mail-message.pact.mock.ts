import { Injectable } from '@nestjs/common';
import { PactRabbitMqMessageProvider, AbstractMessageMock } from '@pe/pact-kit';
import { DailyReportTransactionMailEventProducer } from '../../../src/transactions/producer'
import { DailyReportDto } from '../../../src/transactions/dto';

@Injectable()
export class DailyReportTransactionsMailMessagesProvider extends AbstractMessageMock {
  
  @PactRabbitMqMessageProvider('payever.event.payment.email')
  public async mockProduceDailyReportTransactionsEvent(): Promise<void> {
    const producer: DailyReportTransactionMailEventProducer 
      = await this.getProvider<DailyReportTransactionMailEventProducer>(DailyReportTransactionMailEventProducer);
    await producer.produceDailyReportTransactionEvent([
      {
        currency: 'EUR',
        exchangeRate: 1,
        overalTotal: 1000,
        todayTotal: 100,
      },
      {
        currency: 'NOK',
        exchangeRate: 11.701,
        overalTotal: 1000,
        todayTotal: 100,
      },
    ]);
  }
}
