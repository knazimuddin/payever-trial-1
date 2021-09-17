import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  UserPerBusinessTransactionInPeriodInterface,
} from '../interfaces';
import { TransactionModel } from '../models';
import { TransactionEventProducer } from '../producer';
import { TransactionSchemaName } from '../schemas';

export class ExportUserPerBusinessTransactionService {
  constructor(
    @InjectModel(TransactionSchemaName) private readonly transactionsModel: Model<TransactionModel>,
    private readonly transactionsEventProducer: TransactionEventProducer,
  ) { }

  public async exportUserPerBusinessTransactionPreviousNMonth(n: number): Promise<void> {
    const firstDayLastMonth: Date = this.getFirstDayOfPreviousNMonth(n);
    const lastDayLastMonth: Date = this.getLastDayOfPreviousNMonth(n);

    const monthlyUserTransactions: UserPerBusinessTransactionInPeriodInterface[] =
      await this.getMonthlyUserTransactions(firstDayLastMonth, lastDayLastMonth);

    await this.transactionsEventProducer.produceExportMonthlyUserPerBusinessTransactionEvent(monthlyUserTransactions);
  }

  public async exportUserPerBusinessTransactionTotal(): Promise<void> {
    const userPerBusinessTransactionsTotal: UserPerBusinessTransactionInPeriodInterface[] =
      await this.getTotalUserPerBusinessTransactions();

    await this.transactionsEventProducer
      .produceExportTotalUserPerBusinessTransactionEvent(userPerBusinessTransactionsTotal);
  }

  private async getMonthlyUserTransactions(
    firstDayLastMonth: Date,
    lastDayLastMonth: Date,
  ): Promise<UserPerBusinessTransactionInPeriodInterface[]> {
    return this.getUserPerBusinessTransactionsInPeriod(firstDayLastMonth, lastDayLastMonth);
  }

  private async getUserPerBusinessTransactionsInPeriod(
    start?: Date,
    end?: Date,
  ): Promise<UserPerBusinessTransactionInPeriodInterface[]> {
    const matches: any[] = [];
    if (start && end) {
      matches.push({
        'updated_at': {
          '$gte': start,
          '$lte': end,
        },
      });
    }

    return this.transactionsModel.aggregate<UserPerBusinessTransactionInPeriodInterface>(
      [
        {
          '$match': {
            '$and': [
              {
                'status': {
                  '$in': [
                    'STATUS_ACCEPTED', 'STATUS_PAID', 'STATUS_REFUNDED',
                  ],
                },
              },
              ...matches,
            ],
          },
        }, {
          '$group': {
            '_id': {
              'businessId': '$business_uuid',
              'userId': '$user_uuid',
            },
            'currency': {
              '$first': '$currency',
            },
            'date': {
              '$first': {
                '$dateToString': {
                  'date': '$updated_at',
                  'format': '%Y-%m',
                },
              },
            },
            'totalSpent': {
              '$sum': '$amount',
            },
            'transactions': {
              '$sum': 1,
            },
          },
        }, {
          '$project': {
            'businessId': '$_id.businessId',
            'currency': '$currency',
            'date': '$date',
            'totalSpent': '$totalSpent',
            'transactions': '$transactions',
            'userId': '$_id.userId',
          },
        },
      ],
    );
  }

  private async getTotalUserPerBusinessTransactions(): Promise<UserPerBusinessTransactionInPeriodInterface[]> {
    return this.getUserPerBusinessTransactionsInPeriod();
  }

  private getFirstDayOfPreviousNMonth(n: number): Date {
    const date: Date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - n);

    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
  }

  private getLastDayOfPreviousNMonth(n: number): Date {
    const date: Date = new Date();
    date.setDate(0);
    date.setMonth(date.getMonth() - (n - 1));

    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));
  }
}
