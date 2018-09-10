import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';

export interface Filter {
  condition: 'is' | 'isNot' | 'isIn' | 'isNotIn' | 'startsWith' | 'endsWith' | 'contains' | 'doesNotContain';
  // 'is' | 'isNot' | 'contains' | 'doesNotContain' | 'startsWith' | 'endsWith' | 'afterDate' | 'beforeDate' | 'isDate' | 'isNotDate'| 'betweenDates' | 'greaterThan' | 'lessThan' | 'between' | 'choice'
  value: any;
}

@Injectable()
export class TransactionsService {

  constructor(@InjectModel('TransactionsSchema') private readonly transactionsModel: Model<any>) {
  }

  async create(transaction: any) {
    return await this.transactionsModel.create({
      ...transaction,
      uuid: uuid(),
    });
  }

  async findOne(uuid: string) {
    return await this.transactionsModel.findOne({uuid});
  }

  async findMany(
    filters = {},
    sort = {},
    search = null,
    page: number = null,
    limit = null,
  ) {

    const mongoFilters = {};

    if (filters) {
      this.addFilters(mongoFilters, filters);
    }

    console.log('filters processed', mongoFilters);

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
    const regex = new RegExp(search);
    filters['$or'] = [
      { customer_name: regex},
      { customer_email: regex },
      { reference: regex },
    ];
  }

  private addFilters(mongoFilters: any, inputFilters: {[key: string]: Filter}) {
    console.log('adding filters...');
    Object.keys(inputFilters).forEach((key) => this.addFilter(mongoFilters, key, inputFilters[key]));
  }


  // is|isNot|contains|doesNotContain|startsWith|endsWith|afterDate|beforeDate|isDate|isNotDate|betweenDates|greaterThan|lessThan|between|choice ",

  private addFilter(mongoFilters, field: string, filter: Filter) {
    switch (filter.condition) {
      case 'is':
        if (Array.isArray(filter.value)) {
          mongoFilters[field] = { $in: filter.value };
        } else {
          mongoFilters[field] = { $eq: filter.value };
        }
        break;
      case 'isNot':
        if (Array.isArray(filter.value)) {
          mongoFilters[field] = { $nin: filter.value };
        } else {
          mongoFilters[field] = { $ne: filter.value };
        }
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
      case 'endsWith':
        mongoFilters[field] = { $regex: new RegExp(`${filter.value}$`) };
        break;
      case 'contains':
        mongoFilters[field] = { $regex: new RegExp(`${filter.value}`) };
        break;
      case 'doesNotContain':
        mongoFilters[field] = { $not: new RegExp(`${filter.value}`) };
        break;


      // { customer_name: regex},
    }

  }

}
