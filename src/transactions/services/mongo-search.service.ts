import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ListQueryDto, PagingDto, PagingResultDto } from '../dto';
import { CurrencyInterface } from '../interfaces';
import { TransactionModel } from '../models';
import { FiltersList } from '../mongo-filters/filters.list';
import { CurrencyExchangeService } from './currency-exchange.service';

@Injectable()
export class MongoSearchService {

  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<TransactionModel>,
    private readonly currencyExchangeService: CurrencyExchangeService,
  ) {}

  public async getResult(listDto: ListQueryDto): Promise<PagingResultDto> {
    const mongoFilters: any = {};
    if (listDto.filters) {
      this.addFilters(mongoFilters, listDto.filters);
    }
    if (listDto.search) {
      this.addSearchFilters(mongoFilters, listDto.search);
    }

    return Promise
      .all([
        this.search(mongoFilters, listDto.sorting, listDto.paging),
        this.count(mongoFilters),
        this.total(mongoFilters, listDto.currency),
        this.distinctFieldValues('status', mongoFilters),
        this.distinctFieldValues('specific_status', mongoFilters),
      ])
      .then((res: any) => {
        return {
          collection: res[0],
          filters: {},
          pagination_data: {
            amount: res[2],
            amount_currency: listDto.currency,
            page: listDto.page,
            total: res[1],
          },
          usage: {
            specific_statuses: res[4],
            statuses: res[3],
          },
        };
      })
    ;
  }

  public async search(
    filters: any,
    sorting: { [key: string]: string },
    paging: PagingDto,
  ): Promise<any> {
    return this.transactionsModel
      .find(filters)
      .limit(paging.limit)
      .skip(paging.limit * (paging.page - 1))
      .sort(sorting)
    ;
  }

  public async count(filters: any): Promise<number> {
    return this.transactionsModel.countDocuments(filters);
  }

  public async total(filters: any = {}, currency?: string): Promise<number> {
    let res: any;
    if (!currency) {
      res = await this.transactionsModel
        .aggregate([
          { $match: filters },
          {
            $group: {
              _id: null,
              total: { $sum: '$total' },
            },
          },
        ])
      ;

      res = res && res[0]
        ? res[0].total
        : null
      ;
    } else {
      res = await this.transactionsModel
        .aggregate([
          { $match: filters },
          {
            $group: {
              _id: '$currency',
              total: { $sum: '$total' },
            },
          },
        ])
      ;

      let totalPerCurrency: number = 0;

      for (const currentVal of res) {
        const filteredRate: number = await this.currencyExchangeService.getCurrencyExchangeRate(currentVal._id);

        totalPerCurrency += filteredRate
          ? currentVal.total / filteredRate
          : currentVal.total;
      }

      const rate: number = await this.currencyExchangeService.getCurrencyExchangeRate(currency);

      return rate
        ? totalPerCurrency * rate
        : totalPerCurrency;
    }

    return res;
  }

  public async distinctFieldValues(field: string, filters: any = {}): Promise<Array<{ [key: string]: number}>> {
    return this.transactionsModel
      .find(filters)
      .distinct(field)
    ;
  }

  private addSearchFilters(filters: any, search: string): void {
    /** Necessary to cut # symbol */
    search = search.replace(/^#/, '');
    const regex: RegExp = new RegExp(search, 'i');
    filters.$or = [
      { merchant_name: regex },
      { merchant_email: regex },
      { customer_name: regex },
      { customer_email: regex },
      { reference: regex },
      { original_id: regex },
      { santander_applications: regex },
    ];
  }

  private addFilters(mongoFilters: any, inputFilters: any): void {
    Object.keys(inputFilters).forEach((key: string) => this.addFilter(mongoFilters, key, inputFilters[key]));
  }

  private addFilter(mongoFilters: any, field: string, filter: any): void {
    if (field === 'channel_set_uuid') {
      mongoFilters[field] = filter.value;

      return;
    }
    if (!mongoFilters.$and) {
      mongoFilters.$and = [];
    }
    if (filter && !filter.length) {
      filter = [filter];
    }
    for (const _filter of filter) {
      if (!_filter.value) {
        return;
      }
      if (!Array.isArray(_filter.value)) {
        _filter.value = [_filter.value];
      }
      for (const mongoFilter of FiltersList) {
        if (_filter.condition === mongoFilter.getName()) {
          mongoFilter.apply(mongoFilters, field, _filter);
          break;
        }
      }
    }

    if (!mongoFilters.$and.length) {
      delete mongoFilters.$and;
    }
  }
}
