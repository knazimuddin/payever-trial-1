import { Injectable } from '@nestjs/common';
import { RabbitMqClient } from '@pe/nest-kit';
import { DailyReportMailDtoConverter } from '../converter';

import { DailyReportCurrencyDto, DailyReportMailDto, DailyReportPaymentOptionDto } from '../dto/report';

@Injectable()
export class DailyReportTransactionMailEventProducer {
  constructor(
    private readonly rabbitMqClient: RabbitMqClient,
  ) {}

  public async produceDailyReportTransactionEvent(
    dailyReportCurrencyDto: DailyReportCurrencyDto[],
  ): Promise<void> {
    const mailDto: DailyReportMailDto 
      = DailyReportMailDtoConverter.fromDailyReportCurrencyDto(dailyReportCurrencyDto);
    
    return this.sendMailEvent(mailDto);
  }

  private async sendMailEvent(mailDto: DailyReportMailDto): Promise<void> {
    await this.rabbitMqClient.send(
      {
        channel: 'payever.event.transactions.daily.report.send',
        exchange: 'async_events',
      },
      {
        name: 'payever.event.transactions.daily.report.send',
        payload: mailDto,
      },
    );
  }
}
