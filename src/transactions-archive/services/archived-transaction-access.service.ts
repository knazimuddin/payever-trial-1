import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BusinessModel } from '@pe/business-kit';
import { ArchivedTransactionAccessModel, ArchivedTransactionModel } from '../models';
import { TransactionsArchiveAccessSchemaName } from '../schemas';

@Injectable()
export class ArchivedTransactionAccessService {
  constructor(
    @InjectModel(TransactionsArchiveAccessSchemaName)
      private readonly transactionsArchiveAccessModel: Model<ArchivedTransactionAccessModel>,
  ) { }

  public async createOrUpdateById(
    business: BusinessModel,
  ): Promise<ArchivedTransactionAccessModel> {
    return this.transactionsArchiveAccessModel.findOneAndUpdate(
      {
        businessId: business._id,
      },
      {
        $setOnInsert: {
          businessId: business._id,
        },
      },
      {
        new: true,
        upsert: true,
      },
    );
  }

  public async index(archivedTransaction: ArchivedTransactionModel): Promise<void> {
    // TODO
  }
}
