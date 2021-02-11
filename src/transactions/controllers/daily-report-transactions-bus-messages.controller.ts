import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitRoutingKeys, RabbitChannels } from '../../enums';
import { DailyReportCurrencyDto, DailyReportFilterDto } from '../dto';
import { DailyReportTransactionMailerReportEventProducer } from '../producer';
import { DailyReportTransactionsService } from '../services';

@Controller()
export class DailyReportTransactionBusMessagesController {
  constructor(
    private readonly dailyReportTransactionsService: DailyReportTransactionsService,
    private readonly dailyReportTransactionMailerReportEventProducer: DailyReportTransactionMailerReportEventProducer,
  ) { }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.MailerReportDailyReportRequested,
  })
  public async onMailerReportDailyReportRequested(dailyReportFilterDto: DailyReportFilterDto): Promise<void> {

    const mongoCurrencyReport: DailyReportCurrencyDto[]
      = await this.dailyReportTransactionsService.getDailyReportCurrency(dailyReportFilterDto);
    await this.dailyReportTransactionsService.getDailyReportPaymentOption(dailyReportFilterDto, mongoCurrencyReport);

    await this.dailyReportTransactionMailerReportEventProducer.produceDailyReportTransactionEvent(mongoCurrencyReport);
  }
}
