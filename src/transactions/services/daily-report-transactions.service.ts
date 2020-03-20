import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TransactionModel } from '../models';
import { CurrencyExchangeService } from './currency-exchange.service';
import { DailyReportDto } from '../dto/report';
import * as moment from 'moment';

@Injectable()
export class DailyReportTransactionsService {

  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<TransactionModel>,
    private readonly currencyExchangeService: CurrencyExchangeService,
  ) {}

  public async getDailyReport(): Promise<DailyReportDto[]> {
    const todayDate: Date = moment().startOf('day').toDate();
    const result: DailyReportDto[] = [];

    const todayByCurrency: any = await this.transactionsModel
      .aggregate([
        { $match: {"created_at": {"$gte": todayDate}} },
        {
          $group: {
            _id: '$currency',
            total: { $sum: '$total' },
          },
        },
      ])
    ;

    for (const currentVal of todayByCurrency) {
      result.push({
        currency: currentVal._id,
        exchangeRate: await this.currencyExchangeService.getCurrencyExchangeRate(currentVal._id),
        overalTotal: 0,
        todayTotal: currentVal.total,
      });
    }

    const beforeTodayByCurrency: any = await this.transactionsModel
      .aggregate([
        { $match: {"created_at": {"$lt": todayDate}} },
        {
          $group: {
            _id: '$currency',
            total: { $sum: '$total' },
          },
        },
      ])
    ;

    for (const currentVal of beforeTodayByCurrency) {
      const currentIndex: number = result.findIndex(
        (value: DailyReportDto) => value.currency === currentVal._id ); 
      if(currentIndex !== -1) {
        result[currentIndex].overalTotal = currentVal.total;
      }
      else {
        result.push({
          currency: currentVal._id,
          exchangeRate: await this.currencyExchangeService.getCurrencyExchangeRate(currentVal._id),
          overalTotal: currentVal.total,
          todayTotal: 0,
        });
      }
    }

    return result;
  }
}
