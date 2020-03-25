import { Injectable } from '@nestjs/common';
import { RabbitMqClient } from '@pe/nest-kit';

import { DailyReportCurrencyDto} from '../dto/report';

@Injectable()
export class DailyReportTransactionMailerReportEventProducer {
  constructor(
    private readonly rabbitMqClient: RabbitMqClient,
  ) {}

  public async produceDailyReportTransactionEvent(
    dailyReportCurrencyDto: DailyReportCurrencyDto[],
  ): Promise<void> {
    
    return this.sendMailEvent(dailyReportCurrencyDto);
  }

  private async sendMailEvent(dailyReportCurrencyDto: DailyReportCurrencyDto[]): Promise<void> {
    await this.rabbitMqClient.send(
      {
        channel: 'transactions.event.report.daily',
        exchange: 'async_events',
      },
      {
        name: 'transactions.event.report.daily',
        payload: dailyReportCurrencyDto,
      },
    );
  }
}
