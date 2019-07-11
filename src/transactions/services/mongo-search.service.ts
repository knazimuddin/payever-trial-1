import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DateStringHelper } from '../converter';
import { ListQueryDto, PagingDto, PagingResultDto } from '../dto';
import { FilterConditionEnum } from '../enum';
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
      .then((res) => {
        return {
          collection: res[0],
          pagination_data: {
            total: res[1],
            page: listDto.page,
            amount: res[2],
          },
          filters: {},
          usage: {
            statuses: res[3],
            specific_statuses: res[4],
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

  public async count(filters): Promise<number> {
    return this.transactionsModel
      .countDocuments(filters)
      .exec();
  }

  public async total(filters = {}, currency = null): Promise<number> {
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
        ]);

      res = res && res[0]
        ? res[0].total
        : null
      ;
    } else {
      const rates = await this.currencyExchangeService.getCurrencyExchanges();
      res = await this.transactionsModel
        .aggregate([
          { $match: filters },
          {
            $group: {
              _id: '$currency',
              total: { $sum: '$total' },
            },
          },
        ]);

      const totalPerCurrency: number = res.reduce(
        (acc, currentVal) => {
          const filteredRate = rates.find(x => x.code === currentVal._id);
          const addition = filteredRate
            ? currentVal.total / filteredRate.rate
            : currentVal.total
          ;

          return acc + addition;
        },
        0,
      );

      const rate = rates.find(x => x.code === currency);

      return totalPerCurrency * rate.rate;
    }

    return res;
  }

  public async distinctFieldValues(field, filters = {}) {
    return this.transactionsModel
      .find(filters)
      .distinct(field)
      .exec();
  }

  private addSearchFilters(filters: any, search: string) {
    search = search.replace(/^#/, ''); // cutting # symbol
    const regex = new RegExp(search, 'i');
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

  private addFilters(mongoFilters: any, inputFilters: any) {
    Object.keys(inputFilters).forEach((key) => this.addFilter(mongoFilters, key, inputFilters[key]));
  }

  /**
   * is|isNot|contains|doesNotContain|startsWith
   * |endsWith|afterDate|beforeDate|isDate|isNotDate
   * |betweenDates|greaterThan|lessThan|between|choice
   */
  private addFilter(mongoFilters, field: string, filter: any) {
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
    filter.forEach(_filter => {
      if (!_filter.value) {
        return;
      }
      if (!Array.isArray(_filter.value)) {
        _filter.value = [_filter.value];
      }
      let condition;
      let timeStamps;
      let from;
      let to;
      switch (_filter.condition) {
        case FilterConditionEnum.Is:
          condition = {};
          condition[field] = {};
          condition[field] = { $in: _filter.value };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.IsNot:
          condition = {};
          condition[field] = {};
          condition[field] = { $nin: _filter.value };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.StartsWith:
          if (_filter.value.length) {
            const regex = [];
            _filter.value.forEach(elem => {
              regex.push(new RegExp(`^${elem}`, 'i'));
            });
            condition = {};
            condition[field] = {};
            condition[field] = { $in: regex };
            mongoFilters.$and.push(condition);
          }
          break;
        case FilterConditionEnum.EndsWith:
          if (_filter.value.length) {
            const regex = [];
            _filter.value.forEach(elem => {
              regex.push(new RegExp(`${elem}$`, 'i'));
            });
            condition = {};
            condition[field] = {};
            condition[field] = { $in: regex };
            mongoFilters.$and.push(condition);
          }
          break;
        case FilterConditionEnum.Contains:
          if (_filter.value.length) {
            const regex = [];
            _filter.value.forEach(elem => {
              regex.push(new RegExp(`${elem}`, 'i'));
            });
            condition = {};
            condition[field] = {};
            condition[field] = { $in: regex };
            mongoFilters.$and.push(condition);
          }
          break;
        case FilterConditionEnum.DoesNotContain:
          if (_filter.value.length) {
            const regex = [];
            _filter.value.forEach(elem => {
              regex.push(new RegExp(`${elem}`, 'i'));
            });
            condition = {};
            condition[field] = {};
            condition[field] = { $nin: regex };
            mongoFilters.$and.push(condition);
          }
          break;
        case FilterConditionEnum.GreaterThan:
          condition = {};
          condition[field] = {};
          condition[field] = { $gt: Math.max(_filter.value) };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.LessThan:
          condition = {};
          condition[field] = {};
          condition[field] = { $lt: Math.min(_filter.value) };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.Between:
          condition = {};
          condition[field] = {};
          from = _filter.value.map(elem => parseInt(elem.from, 10));
          to = _filter.value.map(elem => parseInt(elem.to, 10));
          condition[field] = {
            $gte: Math.max(...from),
            $lte: Math.min(...to),
          };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.IsDate:
          condition = { $and: [] };
          _filter.value.forEach(elem => {
            condition.$and.push({
              [field]: {
                $gte: DateStringHelper.getDateStart(elem),
                $lt: DateStringHelper.getTomorrowDateStart(elem),
              },
            });

            return condition;
          });
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.IsNotDate:
          condition = { $and: [] };
          _filter.value.forEach(elem => {
            condition.$and.push({
              [field]: {
                $not: {
                  $gte: DateStringHelper.getDateStart(elem),
                  $lt: DateStringHelper.getTomorrowDateStart(elem),
                },
              },
            });

            return condition;
          });
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.AfterDate:
          timeStamps = _filter.value.map(elem => (new Date(DateStringHelper.getDateStart(elem))).getTime());
          condition = {};
          condition[field] = {};
          condition[field] = {
            $gte: Math.max(timeStamps),
          };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.BeforeDate:
          timeStamps = _filter.value.map(elem => (new Date(DateStringHelper.getTomorrowDateStart(elem))).getTime());
          condition = {};
          condition[field] = {};
          condition[field] = {
            $lt: Math.min(timeStamps),
          };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.BetweenDates:
          from = _filter.value.map(elem => (new Date(DateStringHelper.getDateStart(elem))).getTime());
          to = _filter.value.map(elem => (new Date(DateStringHelper.getTomorrowDateStart(elem))).getTime());
          condition = {};
          condition[field] = {};
          condition[field] = {
            $gte: Math.max(from),
            $lte: Math.min(to),
          };
          mongoFilters.$and.push(condition);
          break;
      }
    });

    if (!mongoFilters.$and.length) {
      delete mongoFilters.$and;
    }
  }
}
