import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  MonthlyUserPerBusinessTransactionInterface,
  TotalUserPerBusinessTransactionInterface,
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

    const monthlyUserTransactions: MonthlyUserPerBusinessTransactionInterface[] =
      await this.getMonthlyUserTransactions(firstDayLastMonth, lastDayLastMonth);

    await this.transactionsEventProducer.produceExportMonthlyUserPerBusinessTransactionEvent(monthlyUserTransactions);
  }

  public async exportUserPerBusinessTransactionTotal(): Promise<void> {
    const userPerBusinessTransactionsTotal: TotalUserPerBusinessTransactionInterface[] =
      await this.getTotalUserPerBusinessTransactions();

    await this.transactionsEventProducer
      .produceExportTotalUserPerBusinessTransactionEvent(userPerBusinessTransactionsTotal);
  }

  private async getMonthlyUserTransactions(
    firstDayLastMonth: Date,
    lastDayLastMonth: Date,
  ): Promise<any[]> {
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
        }, {
          '$group': {
            '_id': '$user_uuid',
            'byBusiness': {
              '$addToSet': {
                'businessId': '$business_uuid',
                'currency': '$currency',
                'date': {
                  '$dateToString': {
                    'date': '$updated_at',
                    'format': '%Y-%m',
                  },
                },
                'totalSpent': {
                  '$sum': '$amount',
                },
              },
            },
          },
        }, {
          '$unwind': {
            'path': '$byBusiness',
          },
        }, {
          '$project': {
            'businessId': '$byBusiness.businessId',
            'currency': '$byBusiness.currency',
            'date': '$byBusiness.date',
            'totalSpent': '$byBusiness.totalSpent',
            'userId': '$_id',
          },
        },
      ],
    );
  }

  private async getTotalUserPerBusinessTransactions(): Promise<TotalUserPerBusinessTransactionInterface[]> {
    return this.transactionsModel.aggregate(
      [
        {
          '$match': {
            'user_uuid': '28804dcf-9fa0-4543-9b3d-e68464ccd69a',
          },
        }, {
          '$group': {
            '_id': '$user_uuid',
            'byBusiness': {
              '$addToSet': {
                'businessId': '$business_uuid',
                'currency': '$currency',
                'totalSpent': {
                  '$sum': '$amount',
                },
                'transactions': {
                  '$sum': 1,
                },
              },
            },
          },
        }, {
          '$unwind': {
            'path': '$byBusiness',
          },
        }, {
          '$project': {
            'businessId': '$byBusiness.businessId',
            'currency': '$byBusiness.currency',
            'totalSpent': '$byBusiness.totalSpent',
            'transactions': '$byBusiness.transactions',
            'userId': '$_id',
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


