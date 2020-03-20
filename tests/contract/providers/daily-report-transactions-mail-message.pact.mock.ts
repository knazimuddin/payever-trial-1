import { Injectable } from '@nestjs/common';
import { PactRabbitMqMessageProvider, AbstractMessageMock } from '@pe/pact-kit';
import { DailyReportTransactionMailEventProducer } from '../../../src/transactions/producer'

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
