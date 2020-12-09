import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TransactionModel } from '../models';
import { TransactionSchemaName } from '../schemas';
import { MonthlyBusinessTransactionInterface } from '../interfaces/transaction';
import { TransactionEventProducer } from '../producer';

export class ExportMonthlyBusinessTransactionService {
  constructor(
    @InjectModel(TransactionSchemaName) private readonly transactionsModel: Model<TransactionModel>,
    private readonly transactionsEventProducer: TransactionEventProducer,
  ) { }

  public async exportBusinessTransactionPreviousNMonth(n: number): Promise<void> {
    const firstDayLastMonth: Date = this.getFirstDayOfPreviousNMonth(n);
    const lastDayLastMonth: Date = this.getLastDayOfPreviousNMonth(n);

    const monthlyBusinessTransactions: MonthlyBusinessTransactionInterface[] =
      await this.getMonthlyBusinessTransaction(firstDayLastMonth, lastDayLastMonth);

    await this.transactionsEventProducer.produceExportMonthlyBusinessTransactionEvent(monthlyBusinessTransactions);
  }

  private async getMonthlyBusinessTransaction(
    firstDayLastMonth: Date,
    lastDayLastMonth: Date,
  ): Promise<MonthlyBusinessTransactionInterface[]> {
    return this.transactionsModel.aggregate(
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
              {
                'updated_at': {
                  '$gte': firstDayLastMonth,
                  '$lte': lastDayLastMonth,
                },
              },
            ],
          },
        },
        {
          '$group': {
            '_id': '$business_uuid',
            'amount': {
              '$sum': '$amount',
            },
            'date': {
              '$first': {
                '$dateToString': {
                  'date': '$updated_at',
                  'format': '%Y-%m',
                },
              },
            },
            'histories': {
              '$addToSet': {
                '$cond': [
                  {
                    '$eq': [
                      '$status', 'STATUS_REFUNDED',
                    ],
                  }, '$history', '',
                ],
              },
            },
            'transactions': {
              '$addToSet': {
                'currency': '$currency',
                'id': '$uuid',
              },
            },
          },
        },
        {
          '$unwind': {
            'path': '$histories',
          },
        },
        {
          '$unwind': {
            'path': '$histories',
          },
        },
        {
          '$group': {
            '_id': '$_id',
            'amount': {
              '$first': '$amount',
            },
            'date': {
              '$first': '$date',
            },
            'refund': {
              '$sum': {
                '$cond': [
                  {
                    '$eq': [
                      '$histories.action', 'refund',
                    ],
                  }, '$histories.amount', 0,
                ],
              },
            },
            'transactions': {
              '$first': '$transactions',
            },
          },
        },
      ],
    );
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
