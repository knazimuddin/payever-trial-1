import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitRoutingKeys } from '../../enums';
import { DailyReportFilterDto, DailyReportCurrencyDto } from '../dto';
import { DailyReportTransactionsService } from '../services';
import { DailyReportTransactionMailerReportEventProducer } from '../producer';

@Controller()
export class DailyReportTransactionBusMessagesController {
  constructor(
    private readonly dailyReportTransactionsService: DailyReportTransactionsService,
    private readonly dailyReportTransactionMailerReportEventProducer: DailyReportTransactionMailerReportEventProducer,
  ) {}

  @MessagePattern({
    name: RabbitRoutingKeys.MailerReportDailyReportRequested,
  })
  public async onMailerReportDailyReportRequested(dailyReportFilterDto: DailyReportFilterDto): Promise<void> {

    const mongoCurrencyReport: DailyReportCurrencyDto[] 
      = await this.dailyReportTransactionsService.getDailyReportCurency(dailyReportFilterDto);
    await this.dailyReportTransactionsService.getDailyReportPaymentOption(dailyReportFilterDto, mongoCurrencyReport);

    await this.dailyReportTransactionMailerReportEventProducer.produceDailyReportTransactionEvent(mongoCurrencyReport);
  }
}
