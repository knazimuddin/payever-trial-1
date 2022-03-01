import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EventDispatcher } from '@pe/nest-kit';
import { ArchivedTransactionModel } from '../models';
import { ArchivedTransactionSchemaName } from '../schemas';
import { ArchivedTransactionEventsEnum } from '../enums';
import { TransactionModel } from '../../transactions/models';

@Injectable()
export class ArchivedTransactionService {
  constructor(
    @InjectModel(ArchivedTransactionSchemaName)
      private readonly archivedTransactionModel: Model<ArchivedTransactionModel>,
    private readonly eventDispatcher: EventDispatcher,
  ) { }

  public async createOrUpdateById(
    businessId: string,
    transaction: TransactionModel,
  ): Promise<ArchivedTransactionModel> {
    const archivedTransaction: ArchivedTransactionModel = await this.archivedTransactionModel.findOneAndUpdate(
      {
        _id: transaction._id,
      },
      {
        $set: {
          ...transaction.toObject(),
          businessId,
        },
      },
      {
        new: true,
        upsert: true,
      },
    );

    await this.eventDispatcher.dispatch(ArchivedTransactionEventsEnum.Created, archivedTransaction);

    return archivedTransaction;
  }
}
