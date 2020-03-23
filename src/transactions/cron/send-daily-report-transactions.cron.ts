import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { DailyReportTransactionsService } from '../services';
import { DailyReportCurrencyDto } from '../dto/report';
import { DailyReportTransactionMailEventProducer } from '../producer';
import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { environment } from '../../environments';

@Injectable()
export class SendDailyReportTransactionsCron extends Server implements CustomTransportStrategy {

  constructor(
    private readonly dailyReportTransactionsService: DailyReportTransactionsService,
    private readonly dailyReportTransactionsMailProducer: DailyReportTransactionMailEventProducer,
    protected readonly logger: Logger,
  ) {
    super();
  }

  public async listen(callback: () => void): Promise<void> {
    await cron.schedule(environment.dailyReportExpression, () => this.sendDailyReportTransaction());
    callback();
  }

  public async close(): Promise<void> {
    return null;
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
