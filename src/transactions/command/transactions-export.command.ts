import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Command } from '@pe/nest-kit/modules/command';
import { StatisticsService } from '../services/statistics.service';

@Injectable()
export class TransactionsExportCommand {
  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<any>,
    private readonly statisticsService: StatisticsService,
  ) { }

  @Command({ command: 'transactions:export', describe: 'Export transactions for widgets' })
  public async businessExport() {
    const count: number = await this.transactionsModel.countDocuments({
      status: { $in: ['STATUS_ACCEPTED', 'STATUS_PAID', 'STATUS_REFUNDED']},
    });
    const limit: number = 1000;
    let start: number = 0;
    let transactions = [];

    while (start < count) {
      transactions = await this.getWithLimit(start, limit);
      start += limit;

      for (const transaction of transactions) {
        await this.statisticsService.processMigratedTransaction(transaction);
      }

      console.log(`Exported ${start} of ${count}`);
    }
  }

  private async getWithLimit(start: number, limit: number): Promise<any[]> {
    return this.transactionsModel.find(
      {
        status: { $in: ['STATUS_ACCEPTED', 'STATUS_PAID', 'STATUS_REFUNDED']},
      },
      null,
      {
        sort: { _id: 1 },
        skip: start,
        limit: limit,
      },
    );
  }
}
