import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EventDispatcher } from '@pe/nest-kit';
import { BusinessModel } from '@pe/business-kit';
import { TransactionsArchiveAccessModel } from '../models';
import { TransactionsArchiveAccessSchemaName } from '../schemas';

@Injectable()
export class TransactionsArchiveAccessService {
  constructor(
    @InjectModel(TransactionsArchiveAccessSchemaName) private readonly transactionsArchiveAccessModel: Model<TransactionsArchiveAccessModel>,
  ) { }

  public async createOrUpdateById(business: BusinessModel): Promise<TransactionsArchiveAccessModel> {
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
}
