import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Command } from '@pe/nest-kit';
import { Model } from 'mongoose';
import { TransactionModel } from '../models';
import { StatisticsService } from '../services';

@Injectable()
export class TransactionsExportCommand {
  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<TransactionModel>,
    private readonly statisticsService: StatisticsService,
  ) {}

  @Command({ command: 'transactions:export', describe: 'Export transactions for widgets' })
  public async businessExport(): Promise<void> {
    const count: number = await this.transactionsModel.countDocuments({
      status: { $in: ['STATUS_ACCEPTED', 'STATUS_PAID', 'STATUS_REFUNDED']},
    });
    const limit: number = 1000;
    let start: number = 0;
    let transactions: TransactionModel[] = [];

    while (start < count) {
      transactions = await this.getWithLimit(start, limit);
      start += limit;

      for (const transaction of transactions) {
        await this.statisticsService.processMigratedTransaction(transaction);
      }

      Logger.log(`Exported ${start} of ${count}`);
    }
  }

  private async getWithLimit(start: number, limit: number): Promise<TransactionModel[]> {
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
