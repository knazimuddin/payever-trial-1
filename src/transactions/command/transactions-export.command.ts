import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Command } from 'nestjs-command';
import { StatisticsService } from '../services/statistics.service';

@Injectable()
export class TransactionsExportCommand {
  constructor(
    @InjectModel('TransactionsSchema') private readonly transactionsModel: Model<any>,
    private readonly statisticsService: StatisticsService,
  ) { }

  @Command({ command: 'transactions:export', describe: 'Export transactions for widgets' })
  public async businessExport() {
    const count: number = await this.transactionsModel.countDocuments({});
    const limit: number = 1000;
    let start: number = 0;
    let transactions = [];

    while (start < count) {
      transactions = await this.getWithLimit(start, limit);
      start += limit;

      for (const transaction of transactions) {
        await this.statisticsService.processMigratedTransaction(transaction);
      }
    }
  }

  private async getWithLimit(start: number, limit: number): Promise<any[]> {
    return this.transactionsModel.find(
      {
        status: { $in: ['STATUS_ACCEPTED', 'STATUS_PAID', 'STATUS_REFUNDED']},
      },
      null,
      {
        sort: { createdAt: 1 },
        skip: start,
        limit: limit,
      },
    );
  }
}
