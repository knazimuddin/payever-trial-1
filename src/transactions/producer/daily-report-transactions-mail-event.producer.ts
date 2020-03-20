import { Injectable } from '@nestjs/common';
import { RabbitMqClient } from '@pe/nest-kit';
import { DailyReportMailDtoConverter } from '../converter';

import { DailyReportDto, DailyReportMailDto } from '../dto/report';

@Injectable()
export class DailyReportTransactionMailEventProducer {
  constructor(
    private readonly rabbitMqClient: RabbitMqClient,
  ) {}

  public async produceDailyReportTransactionEvent(dailyReportDto: DailyReportDto[]): Promise<void> {
    const mailDto: DailyReportMailDto = DailyReportMailDtoConverter.fromDailyReportDto(dailyReportDto);
    
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
