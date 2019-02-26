import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TransactionsService {

  constructor(@InjectModel('Transaction') private readonly transactionsModel: Model<any>) {
  }

  public async createOrUpdate(transaction: any) {
    if (transaction.uuid) {
      const existing = await this.transactionsModel.findOne({uuid: transaction.uuid});
      if (existing) {
        return this.transactionsModel.findOneAndUpdate({uuid: transaction.uuid}, transaction);
      }
    }

    return this.transactionsModel.create(transaction);
  }
}
