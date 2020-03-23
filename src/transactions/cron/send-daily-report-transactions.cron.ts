import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { DailyReportTransactionsService } from '../services';
import { DailyReportCurrencyDto, DailyReportPaymentOptionDto } from '../dto/report';
import { DailyReportTransactionMailEventProducer } from '../producer';
import { environment } from '../../environments';

@Injectable()
export class SendDailyReportTransactionsCron implements OnModuleInit {

  constructor(
    private readonly dailyReportTransactionsService: DailyReportTransactionsService,
    private readonly dailyReportTransactionsMailProducer: DailyReportTransactionMailEventProducer,
    private readonly logger: Logger,
  ) {}

  public async onModuleInit(): Promise<void> {
    await cron.schedule(environment.dailyReportExpression, () => this.sendDailyReportTransaction());
    this.logger.log('Configured cron schedule.');
  }

  public async sendDailyReportTransaction(): Promise<void> {
    this.logger.log('send daily report transaction...');

    try {
      this.dailyReportTransactionsService.setTodayDate();
      const mongoCurrencyReport: DailyReportCurrencyDto[] 
        = await this.dailyReportTransactionsService.getDailyReportCurency();
      await this.dailyReportTransactionsService.getDailyReportPaymentOption(mongoCurrencyReport);

      return this.dailyReportTransactionsMailProducer.produceDailyReportTransactionEvent(mongoCurrencyReport);
    } catch (e) {
      this.logger.log(e.toString());
    }
  }
}
