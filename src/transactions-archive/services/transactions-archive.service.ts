import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EventDispatcher } from '@pe/nest-kit';
import { TransactionsArchiveModel } from '../models';
import { TransactionsArchiveSchemaName } from '../schemas';
import { TransactionModel } from '../../transactions/models';

@Injectable()
export class TransactionsArchiveService {
  constructor(
    @InjectModel(TransactionsArchiveSchemaName) private readonly transactionsArchiveModel: Model<TransactionsArchiveModel>,
    private readonly eventDispatcher: EventDispatcher,
    private readonly logger: Logger,
  ) { }

  public async createOrUpdateById(businessId: string, transaction: TransactionModel): Promise<TransactionsArchiveModel> {
    return this.transactionsArchiveModel.findOneAndUpdate(
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

    // await this.eventDispatcher.dispatch(
    //   TransactionEventEnum.TransactionUpdated,
    //   updated,
    // );
  }
}
