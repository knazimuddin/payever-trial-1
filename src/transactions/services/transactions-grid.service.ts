import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {snakeCase} from 'lodash';
import {Model, mongo} from 'mongoose';
import {PagingResultDto} from '../dto';

import {FilterConditionEnum} from '../enum';
import {CurrencyExchangeService} from './currency-exchange.service';
import {filter} from "rxjs/operators";

export interface Filter {
  condition: FilterConditionEnum;
  value: any;
}

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

  public async findMany(filters = {}, sort = {}, search = null, page: number = null, limit = null) {
    const mongoFilters = {};
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

    let res: any

    if (!currency) {
      res = await this.transactionsModel
        .aggregate([
          {$match: mongoFilters},
          {
            $group: {
              _id: null,
              total: {$sum: '$total'},
            },
          },
        ]);

      res = res && res[0] ? res[0].total : null
    } else {
      const rates = await this.currencyExchangeService.getCurrencyExchanges();
      res = await this.transactionsModel
        .aggregate([
          {$match: mongoFilters},
          {
            $group: {
              _id: "$currency",
              total: {$sum: '$total'},
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
      {merchant_name: regex},
      {merchant_email: regex},
      {customer_name: regex},
      {customer_email: regex},
      {reference: regex},
      {original_id: regex},
      {santander_applications: regex},
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
    if (!mongoFilters.$or) {
      mongoFilters.$or = [];
    }
    filter.forEach(_filter => {
      if (!_filter.value) {
        return;
      }
      const condition = {};
      condition[field] = {};
      switch (_filter.condition) {
        case FilterConditionEnum.Is:
          condition[field] = {$eq: _filter.value};
          mongoFilters.$or.push(condition);
          break;
        case FilterConditionEnum.IsNot:
          condition[field] = {$ne: _filter.value};
          mongoFilters.$or.push(condition);
          break;
        case FilterConditionEnum.IsIn:
          condition[field] = {$in: _filter.value};
          mongoFilters.$or.push(condition);
          break;
        case FilterConditionEnum.IsNotIn:
          condition[field] = {$nin: _filter.value};
          mongoFilters.$or.push(condition);
          break;
        case FilterConditionEnum.StartsWith:
          condition[field] = {$regex: new RegExp(`^${_filter.value}`, 'i')};
          mongoFilters.$or.push(condition);
          break;
        case FilterConditionEnum.EndsWith:
          condition[field] = {$regex: new RegExp(`${_filter.value}$`, 'i')};
          mongoFilters.$or.push(condition);
          break;
        case FilterConditionEnum.Contains:
          condition[field] = {$regex: new RegExp(`${_filter.value}`, 'i')};
          mongoFilters.$or.push(condition);
          break;
        case FilterConditionEnum.DoesNotContain:
          condition[field] = {$not: new RegExp(`${_filter.value}`, 'i')};
          mongoFilters.$or.push(condition);
          break;
        case FilterConditionEnum.GreaterThan:
          condition[field] = {$gt: _filter.value};
          mongoFilters.$or.push(condition);
          break;
        case FilterConditionEnum.LessThan:
          condition[field] = {$lt: _filter.value};
          mongoFilters.$or.push(condition);
          break;
        case FilterConditionEnum.Between:
          condition[field] = {
            $gte: _filter.value.from,
            $lte: _filter.value.to,
          };
          mongoFilters.$or.push(condition);
          break;
        case FilterConditionEnum.IsDate:
          condition[field] = {
            $gte: this.getTargetDate(_filter.value),
            $lt: this.getTargetTomorrowDate(_filter.value),
          };
          mongoFilters.$or.push(condition);
          break;
        case FilterConditionEnum.IsNotDate:
          condition[field] = {
            $not: {
              $gte: this.getTargetDate(_filter.value),
              $lt: this.getTargetTomorrowDate(_filter.value),
            },
          };
          mongoFilters.$or.push(condition);
          break;
        case FilterConditionEnum.AfterDate:
          condition[field] = {
            $gte: this.getTargetTomorrowDate(_filter.value),
          };
          mongoFilters.$or.push(condition);
          break;
        case FilterConditionEnum.BeforeDate:
          condition[field] = {
            $lt: this.getTargetDate(_filter.value),
          };
          mongoFilters.$or.push(condition);
          break;
        case FilterConditionEnum.BetweenDates:
          condition[field] = {
            $gte: this.getTargetDate(_filter.value.dateFrom),
            $lt: this.getTargetTomorrowDate(_filter.value.dateTo),
          };
          mongoFilters.$or.push(condition);
          break;
      }
    });
    if (!mongoFilters.$or.length) {
      delete mongoFilters.$or;
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
