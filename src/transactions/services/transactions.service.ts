import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TransactionsService {

  constructor(@InjectModel('TransactionsSchema') private readonly transactionsModel: Model<any>) {}

  async create(transaction: any) {
    return await this.transactionsModel.create({
      ...transaction,
      uuid: uuid(),
    });
  }

  async findMany(
    page: number = null,
    limit = null,
    sort = {},
    filters = {},
    search = null,
  ) {
    console.log('page:', page);
    console.log('limit:', limit);
    console.log('sort:', sort);
    console.log('filters:', filters);
    console.log('search:', search);
    return await this.transactionsModel
      .find(filters)
      .limit(limit)
      .skip(limit * (page - 1))
      .sort(sort)
      .exec();
  }

  async count(
    filters = {},
    search = null,
  ) {
    return await this.transactionsModel
      .count(filters)
      .exec();
  }

  async total(
    filters = {},
    search = null,
  ) {
    const res = await this.transactionsModel
      .aggregate([
        { $match: filters },
        { $group: {
            _id: null,
            total: { $sum: '$total' },
        }},
      ])
    ;

    console.log('total???', res);
    return res && res[0] ? res[0].total : null;
  }

}
