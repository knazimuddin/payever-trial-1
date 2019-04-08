import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { snakeCase } from 'lodash';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { PagingResultDto } from '../dto';
import { FilterConditionEnum } from '../enum';
import { client } from '../es-temp/transactions-search';
import { CurrencyExchangeService } from './currency-exchange.service';

@Injectable()
export class TransactionsGridService {

  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<any>,
    private readonly currencyExchangeService: CurrencyExchangeService,
  ) {
  }

  public async getList(
    filters = {},
    orderBy: string,
    direction: string,
    search = null,
    page: number = null,
    limit = null,
    currency = null,
  ): Promise<PagingResultDto> {
    const sort = {};
    sort[snakeCase(orderBy)] = direction.toLowerCase();

    return Promise
      .all([
        this.findMany(filters, sort, search, +page, +limit),
        this.count(filters, search),
        this.total(filters, search, currency),
        this.distinctFieldValues('status', filters, search),
        this.distinctFieldValues('specific_status', filters, search),
      ])
      .then((res) => {
        return {
          collection: res[0],
          pagination_data: {
            totalCount: res[1],
            total: res[2],
            current: page,
          },
          filters: {},
          usage: {
            statuses: res[3],
            specific_statuses: res[4],
          },
        };
      });
  }

  public async search(search, business_uuid) {
    const body: any = {
      from: 0,
      query: {
        bool: {
          must: {
            query_string: {
              query: `*${search}*`,
              fields: ['original_id^1', 'customer_name^1', 'merchant_name^1',
                'reference^1', 'payment_details.finance_id^1',
                'payment_details.application_no^1', 'customer_email^1'],
            },
          },
        },
      },
    };
    if (business_uuid) {
      body.query.bool.filter = {
        match: {
          business_uuid: business_uuid,
        },
      };
    }

    return client.search({ index: 'transactions', body: body }).then((results: any) => {
      return results.hits.hits.map(elem => {
        elem._source._id = elem._source.mongoId;
        delete elem._source.mongoId;

        return elem._source;
      });
    });
  }

  public async findMany(filters = {}, sort = {}, search = null, page: number = null, limit = null) {
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
      .sort(sort)
      .exec();

    // return this.search(search, mongoFilters.business_uuid);
  }

  public async count(
    filters,
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
      .count(mongoFilters)
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

      res = res && res[0] ? res[0].total : null;
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

      const totalPerCurrency: number = res.reduce((acc, currentVal) => {
        const rate = rates.find(x => x.code === currentVal._id);
        const addition = rate ? currentVal.total / rate.rate : currentVal.total;

        return acc + addition;
      }, 0);

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
            condition[field] = { $in: regex };
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
          condition[field] = {
            $gte: _filter.value.from,
            $lte: _filter.value.to,
          };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.IsDate:
          condition = { $and: [] };
          _filter.value.forEach(elem => {
            condition.$and.push({
              [field]: {
                $gte: this.getTargetDate(elem),
                $lt: this.getTargetTomorrowDate(elem),
              }
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
                  $gte: this.getTargetDate(elem),
                  $lt: this.getTargetTomorrowDate(elem),
                },
              }
            });

            return condition;
          });
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.AfterDate:
          timeStamps = _filter.value.map(elem => this.getTargetDate(elem).getTime());
          condition = {};
          condition[field] = {};
          condition[field] = {
            $gte: Math.max(timeStamps),
          };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.BeforeDate:
          timeStamps = _filter.value.map(elem => this.getTargetTomorrowDate(elem).getTime());
          condition = {};
          condition[field] = {};
          condition[field] = {
            $lt: Math.min(timeStamps),
          };
          mongoFilters.$and.push(condition);
          break;
        case FilterConditionEnum.BetweenDates:
          const from = _filter.value.map(elem => this.getTargetDate(elem.dateFrom).getTime());
          const to = _filter.value.map(elem => this.getTargetTomorrowDate(elem.dateTo).getTime());
          condition = {};
          condition[field] = {};
          condition[field] = {
            $gte: Math.max(from),
            $lt: Math.min(to),
          };
          mongoFilters.$and.push(condition);
          break;
      }
    });

    if (!mongoFilters.$and.length) {
      delete mongoFilters.$and;
    }
  }

  private getTargetDate(value: string) {
    const date = new Date(value);
    date.setSeconds(0);

    return date;
  }

  private getTargetTomorrowDate(value: string) {
    const date = new Date(value);
    date.setDate(date.getDate() + 1);
    date.setSeconds(0);

    return date;
  }
}
