import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DateStringHelper } from '../converter';
import { PagingResultDto, SortDto } from '../dto';
import { FilterConditionEnum } from '../enum';
import { TransactionModel } from '../models';
import { CurrencyExchangeService } from './currency-exchange.service';

@Injectable()
export class MongoSearchService {

  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<TransactionModel>,
    private readonly currencyExchangeService: CurrencyExchangeService,
  ) {}

  public async getResult(
    incomingFilters: any,
    sort: SortDto,
    search?: string,
    page?: number,
    limit?: number,
    currency?: string,
  ): Promise<PagingResultDto> {
    const mongoFilters: any = {};
    if (incomingFilters) {
      this.addFilters(mongoFilters, incomingFilters);
    }
    if (search) {
      this.addSearchFilters(mongoFilters, search);
    }

    return Promise
      .all([
        this.search(mongoFilters, sort, search, +page, +limit),
        this.count(mongoFilters, search),
        this.total(mongoFilters, search, currency),
        this.distinctFieldValues('status', mongoFilters, search),
        this.distinctFieldValues('specific_status', mongoFilters, search),
      ])
      .then((res) => {
        return {
          collection: res[0],
          pagination_data: {
            total: res[1],
            page: page,
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
    sort: SortDto,
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<any> {
    const mongoFilters: any = {};
    if (filters) {
      this.addFilters(mongoFilters, filters);
    }
    if (search) {
      this.addSearchFilters(mongoFilters, search);
    }

    return this.transactionsModel
      .find(mongoFilters)
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ [sort.field]: sort.direction })
      .exec();
  }

  public async count(
    filters,
    search = null,
  ): Promise<number> {
    const mongoFilters = {};
    if (filters) {
      this.addFilters(mongoFilters, filters);
    }
    if (search) {
      this.addSearchFilters(mongoFilters, search);
    }

    return this.transactionsModel
      .countDocuments(mongoFilters)
      .exec();
  }

  public async total(
    filters = {},
    search = null,
    currency = null,
  ): Promise<number> {
    const mongoFilters = {};
    if (filters) {
      this.addFilters(mongoFilters, filters);
    }
    if (search) {
      this.addSearchFilters(mongoFilters, search);
    }

    let res: any;

    if (!currency) {
      res = await this.transactionsModel
        .aggregate([
          { $match: mongoFilters },
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
          { $match: mongoFilters },
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

  public async distinctFieldValues(
    field,
    filters = {},
    search = null,
  ) {
    const mongoFilters = {};
    if (filters) {
      this.addFilters(mongoFilters, filters);
    }
    if (search) {
      this.addSearchFilters(mongoFilters, search);
    }

    return this.transactionsModel
      .find(mongoFilters)
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
