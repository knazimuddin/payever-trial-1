import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TransactionsService {

  constructor(@InjectModel('TransactionsSchema') private readonly transactionsModel: Model<any>) {
  }

  async createOrUpdate(transaction: any) {
    if (transaction.uuid) {
      const existing = await this.transactionsModel.findOne({uuid: transaction.uuid});
      if (existing) {
        console.log('record exists');
        return this.transactionsModel.findOneAndUpdate({uuid: transaction.uuid}, transaction);
      }
    }

    console.log('creating new record');
    return await this.transactionsModel.create(transaction);
  }

}
