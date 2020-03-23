import { Injectable } from '@nestjs/common';
import { PactRabbitMqMessageProvider, AbstractMessageMock } from '@pe/pact-kit';
import { DailyReportTransactionMailerReportEventProducer } from '../../../src/transactions/producer'

@Injectable()
export class DailyReportTransactionsMailMessagesProvider extends AbstractMessageMock {
  
  @PactRabbitMqMessageProvider('mailer-report.event.daily-report-data.sent')
  public async mockProduceDailyReportTransactionsEvent(): Promise<void> {
    const producer: DailyReportTransactionMailerReportEventProducer 
      = await this.getProvider<DailyReportTransactionMailerReportEventProducer>(DailyReportTransactionMailerReportEventProducer);
    await producer.produceDailyReportTransactionEvent([
      {
        currency: 'EUR',
        exchangeRate: 1,
        overallTotal: 1000,
        paymentOption: [
          {
            overallTotal: 500,
            paymentOption: 'stripe',
            todayTotal: 50,
          },
          {
            overallTotal: 500,
            paymentOption: 'paypal',
            todayTotal: 50,
          },
        ],
        todayTotal: 100,
      },
      {
        currency: 'NOK',
        exchangeRate: 11.701,
        overallTotal: 1000,
        paymentOption: [
          {
            overallTotal: 500,
            paymentOption: 'stripe',
            todayTotal: 50,
          },
          {
            overallTotal: 500,
            paymentOption: 'paypal',
            todayTotal: 50,
          },
        ],
        todayTotal: 100,
      },
    ]);
  }
}
