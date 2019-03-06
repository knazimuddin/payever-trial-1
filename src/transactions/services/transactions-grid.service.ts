import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { snakeCase } from 'lodash';
import { Model } from 'mongoose';
import { PagingResultDto } from '../dto';

import { FilterConditionEnum } from '../enum';

export interface Filter {
  condition: FilterConditionEnum;
  value: any;
}

@Injectable()
export class TransactionsGridService {

  constructor(@InjectModel('Transaction') private readonly transactionsModel: Model<any>) {
  }

  public async getList(
    filters = {},
    orderBy: string,
    direction: string,
    search = null,
    page: number = null,
    limit = null,
  ): Promise<PagingResultDto> {
    const sort = {};
    sort[snakeCase(orderBy)] = direction.toLowerCase();

    return Promise
      .all([
        this.findMany(filters, sort, search, +page, +limit),
        this.count(filters, search),
        this.total(filters, search),
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
  ): Promise<number> {
    const mongoFilters = {};
    if (filters) {
      this.addFilters(mongoFilters, filters);
    }
    if (search) {
      this.addSearchFilters(mongoFilters, search);
    }

    const res = await this.transactionsModel
      .aggregate([
        { $match: mongoFilters },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
          },
        },
      ])
      ;

    return res && res[0] ? res[0].total : null;
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

  private addFilters(mongoFilters: any, inputFilters: { [key: string]: Filter }) {
    Object.keys(inputFilters).forEach((key) => this.addFilter(mongoFilters, key, inputFilters[key]));
  }

  /**
   * is|isNot|contains|doesNotContain|startsWith
   * |endsWith|afterDate|beforeDate|isDate|isNotDate
   * |betweenDates|greaterThan|lessThan|between|choice
   */
  private addFilter(mongoFilters, field: string, filter: Filter) {
    switch (filter.condition) {
      case FilterConditionEnum.Is:
        mongoFilters[field] = { $eq: filter.value };
        break;
      case FilterConditionEnum.IsNot:
        mongoFilters[field] = { $ne: filter.value };
        break;
      case FilterConditionEnum.IsIn:
        mongoFilters[field] = { $in: filter.value };
        break;
      case FilterConditionEnum.IsNotIn:
        mongoFilters[field] = { $nin: filter.value };
        break;
      case FilterConditionEnum.StartsWith:
        mongoFilters[field] = { $regex: new RegExp(`^${filter.value}`, 'i') };
        break;
      case FilterConditionEnum.EndsWith:
        mongoFilters[field] = { $regex: new RegExp(`${filter.value}$`, 'i') };
        break;
      case FilterConditionEnum.Contains:
        mongoFilters[field] = { $regex: new RegExp(`${filter.value}`, 'i') };
        break;
      case FilterConditionEnum.DoesNotContain:
        mongoFilters[field] = { $not: new RegExp(`${filter.value}`, 'i') };
        break;
      case FilterConditionEnum.GreaterThan:
        mongoFilters[field] = { $gt: filter.value };
        break;
      case FilterConditionEnum.LessThan:
        mongoFilters[field] = { $lt: filter.value };
        break;
      case FilterConditionEnum.Between:
        mongoFilters[field] = {
          $gte: filter.value.from,
          $lte: filter.value.to,
        };
        break;
      case FilterConditionEnum.IsDate:
        mongoFilters[field] = {
          $gte: this.getTargetDate(filter.value),
          $lt: this.getTargetTomorrowDate(filter.value),
        };
        break;
      case FilterConditionEnum.IsNotDate:
        mongoFilters[field] = {
          $not: {
            $gte: this.getTargetDate(filter.value),
            $lt: this.getTargetTomorrowDate(filter.value),
          },
        };
        break;
      case FilterConditionEnum.AfterDate:
        mongoFilters[field] = {
          $gte: this.getTargetTomorrowDate(filter.value),
        };
        break;
      case FilterConditionEnum.BeforeDate:
        mongoFilters[field] = {
          $lt: this.getTargetDate(filter.value),
        };
        break;
      case FilterConditionEnum.BetweenDates:
        mongoFilters[field] = {
          $gte: this.getTargetDate(filter.value.dateFrom),
          $lt: this.getTargetTomorrowDate(filter.value.dateTo),
        };
        break;
    }
  }

  private getTargetDate(value: string) {
    const date = new Date(value);
    date.setMinutes(0, 0, 0);

    return date;
  }

  private getTargetTomorrowDate(value: string) {
    const date = new Date(value);
    date.setDate(date.getDate() + 1);
    date.setMinutes(0, 0, 0);

    return date;
  }
}
