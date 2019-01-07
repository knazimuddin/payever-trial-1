import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';

export interface Filter {
  condition: 'is' | 'isNot' | 'isIn' | 'isNotIn' | 'startsWith' | 'endsWith' | 'contains' | 'doesNotContain' | 'isDate' | 'isNotDate' | 'afterDate' | 'beforeDate' | 'betweenDates' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
}

@Injectable()
export class TransactionsGridService {

  constructor(@InjectModel('TransactionsSchema') private readonly transactionsModel: Model<any>) {
  }

  async findMany(filters = {}, sort = {}, search = null, page: number = null, limit = null) {
    const mongoFilters = {};
    if (filters) {
      this.addFilters(mongoFilters, filters);
    }
    if (search) {
      this.addSearchFilters(mongoFilters, search);
    }

    return await this.transactionsModel
      .find(mongoFilters)
      .limit(limit)
      .skip(limit * (page - 1))
      .sort(sort)
      .exec();
  }

  async count(
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

    return await this.transactionsModel
      .count(mongoFilters)
      .exec();
  }

  async total(
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

    const res = await this.transactionsModel
      .aggregate([
        { $match: mongoFilters },
        { $group: {
            _id: null,
            total: { $sum: '$total' },
        }},
      ])
    ;

    return res && res[0] ? res[0].total : null;
  }

  private addSearchFilters(filters: any, search: string) {
    search = search.replace(/^#/, ''); // cutting # symbol
    const regex = new RegExp(search);
    filters.$or = [
      { customer_name: regex},
      { customer_email: regex },
      { reference: regex },
      { original_id: regex },
    ];
  }

  private addFilters(mongoFilters: any, inputFilters: {[key: string]: Filter}) {
    Object.keys(inputFilters).forEach((key) => this.addFilter(mongoFilters, key, inputFilters[key]));
  }

  /**
   * is|isNot|contains|doesNotContain|startsWith|endsWith|afterDate|beforeDate|isDate|isNotDate|betweenDates|greaterThan|lessThan|between|choice ",
   */
  private addFilter(mongoFilters, field: string, filter: Filter) {
    switch (filter.condition) {
      case 'is':
        mongoFilters[field] = { $eq: filter.value };
        break;
      case 'isNot':
        mongoFilters[field] = { $ne: filter.value };
        break;
      case 'isIn':
        mongoFilters[field] = { $in: filter.value };
        break;
      case 'isNotIn':
        mongoFilters[field] = { $nin: filter.value };
        break;
      case 'startsWith':
        mongoFilters[field] = { $regex: new RegExp(`^${filter.value}`) };
        break;
      case 'endsWith':
        mongoFilters[field] = { $regex: new RegExp(`${filter.value}$`) };
        break;
      case 'contains':
        mongoFilters[field] = { $regex: new RegExp(`${filter.value}`) };
        break;
      case 'doesNotContain':
        mongoFilters[field] = { $not: new RegExp(`${filter.value}`) };
        break;
      case 'greaterThan':
        mongoFilters[field] = { $gte: filter.value };
        break;
      case 'lessThan':
        mongoFilters[field] = { $lte: filter.value };
        break;
      case 'between':
        mongoFilters[field] = {
          $gte: filter.value.from,
          $lte: filter.value.to,
        };
        break;
      case 'isDate':
        mongoFilters[field] = {
          $gte: this.getTargetDate(filter.value),
          $lt: this.getTargetTomorrowDate(filter.value),
        };
        break;
      case 'isNotDate':
        mongoFilters[field] = {
          $not: {
            $gte: this.getTargetDate(filter.value),
            $lt: this.getTargetTomorrowDate(filter.value),
          },
        };
        break;
      case 'afterDate':
        mongoFilters[field] = {
          $gte: this.getTargetTomorrowDate(filter.value),
        };
        break;
      case 'beforeDate':
        mongoFilters[field] = {
          $lt: this.getTargetDate(filter.value),
        };
        break;
      case 'betweenDates':
        mongoFilters[field] = {
          $gte: this.getTargetDate(filter.value.dateFrom),
          $lt: this.getTargetTomorrowDate(filter.value.dateTo),
        };
        break;
    }
  }

  private getTargetDate(value: string) {
    const date = new Date(value);
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    return date;
  }

  private getTargetTomorrowDate(value: string) {
    const date = new Date(value);
    date.setDate(date.getDate() + 1);
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    return date;
  }

}
