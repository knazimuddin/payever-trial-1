import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DateStringHelper } from '../converter';
import { ListQueryDto, PagingDto, PagingResultDto } from '../dto';
import { FilterConditionEnum } from '../enum';
import { CurrencyInterface } from '../interfaces';
import { TransactionModel } from '../models';
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
      .exec()
    ;
  }

  public async count(filters: any): Promise<number> {
    return this.transactionsModel
      .countDocuments(filters)
      .exec();
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
        .exec()
      ;

      res = res && res[0]
        ? res[0].total
        : null
      ;
    } else {
      const rates: CurrencyInterface[] = await this.currencyExchangeService.getCurrencyExchanges();
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
        .exec()
      ;

      const totalPerCurrency: number = res.reduce(
        (acc: number, currentVal: { _id: string, total: number }) => {
          const filteredRate: CurrencyInterface = rates.find(
            (x: { code: string }) => x.code === currentVal._id,
          );
          const addition: number = filteredRate
            ? currentVal.total / filteredRate.rate
            : currentVal.total
          ;

          return acc + addition;
        },
        0,
      );
      const rate: CurrencyInterface = rates.find((x: { code: string }) => x.code === currency);

      return totalPerCurrency * rate.rate;
    }

    return res;
  }

  public async distinctFieldValues(field: string, filters: any = {}): Promise<Array<{ [key: string]: number}>> {
    return this.transactionsModel
      .find(filters)
      .distinct(field)
      .exec();
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
    if (field === 'business_uuid') {
      mongoFilters[field] = filter.value;

      return;
    }

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
      let condition: {};
      let timeStamps: number[];
      let from: any;
      let to: any;
      switch (_filter.condition) {
        case FilterConditionEnum.Is:
          condition = {};
          condition[field] = { $in: _filter.value };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.IsNot:
          condition[field] = { $nin: _filter.value };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.StartsWith:
          if (_filter.value.length) {
            const regex: RegExp[] = [];
            _filter.value.forEach((elem: string) => {
              regex.push(new RegExp(`^${elem}`, 'i'));
            });
            condition[field] = { $in: regex };
            mongoFilters.$and.push(condition);
          }
          break;
        case FilterConditionEnum.EndsWith:
          if (_filter.value.length) {
            const regex: RegExp[] = [];
            _filter.value.forEach((elem: string) => {
              regex.push(new RegExp(`${elem}$`, 'i'));
            });
            condition[field] = { $in: regex };
            mongoFilters.$and.push(condition);
          }
          break;
        case FilterConditionEnum.Contains:
          if (_filter.value.length) {
            const regex: RegExp[] = [];
            _filter.value.forEach((elem: string) => {
              regex.push(new RegExp(`${elem}`, 'i'));
            });
            condition = {};
            condition[field] = { $in: regex };
            mongoFilters.$and.push(condition);
          }
          break;
        case FilterConditionEnum.DoesNotContain:
          if (_filter.value.length) {
            const regex: RegExp[] = [];
            _filter.value.forEach((elem: string) => {
              regex.push(new RegExp(`${elem}`, 'i'));
            });
            condition = {};
            condition[field] = { $nin: regex };
            mongoFilters.$and.push(condition);
          }
          break;
        case FilterConditionEnum.GreaterThan:
          condition[field] = { $gt: Math.max(_filter.value) };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.LessThan:
          condition[field] = { $lt: Math.min(_filter.value) };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.Between:
          condition = {};
          from = _filter.value.map((elem: { from: string }) => parseInt(elem.from, 10));
          to = _filter.value.map((elem: { to: string }) => parseInt(elem.to, 10));
          condition[field] = {
            $gte: Math.max(...from),
            $lte: Math.min(...to),
          };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.IsDate:
          const isDateCondition: { $and: Array<{ [key: string]: { $gte: string, $lt: string }}> } = { $and: [] };
          _filter.value.forEach((elem: string) => {
            isDateCondition.$and.push({
              [field]: {
                $gte: DateStringHelper.getDateStart(elem),
                $lt: DateStringHelper.getTomorrowDateStart(elem),
              },
            });

            return isDateCondition;
          });
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.IsNotDate:
          const isNotDateCondition: { $and: Array<{ [key: string]: { $not: { $gte: string, $lt: string }}}> } = { $and: [] };
          _filter.value.forEach((elem: string) => {
            isNotDateCondition.$and.push({
              [field]: {
                $not: {
                  $gte: DateStringHelper.getDateStart(elem),
                  $lt: DateStringHelper.getTomorrowDateStart(elem),
                },
              },
            });

            return isNotDateCondition;
          });
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.AfterDate:
          timeStamps = _filter.value.map((elem: string) => (new Date(DateStringHelper.getDateStart(elem))).getTime());
          condition[field] = {
            $gte: Math.max(...timeStamps),
          };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.BeforeDate:
          timeStamps = _filter.value.map((elem: string) => (new Date(DateStringHelper.getTomorrowDateStart(elem))).getTime());
          condition[field] = {
            $lt: Math.min(...timeStamps),
          };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.BetweenDates:
          from = _filter.value.map((elem: string) => (new Date(DateStringHelper.getDateStart(elem))).getTime());
          to = _filter.value.map((elem: string) => (new Date(DateStringHelper.getTomorrowDateStart(elem))).getTime());
          condition[field] = {
            $gte: Math.max(from),
            $lte: Math.min(to),
          };
          mongoFilters.$and.push(condition);
          break;
      }
    }

    if (!mongoFilters.$and.length) {
      delete mongoFilters.$and;
    }
  }
}
