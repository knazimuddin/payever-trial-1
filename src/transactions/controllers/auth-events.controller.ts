import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RabbitRoutingKeys } from '../../enums';
import { PaymentFlowSchemaName, TransactionSchemaName } from '../schemas';
import { TransactionModel } from '../models';

@Controller()
export class AuthEventsController {
  constructor(
    @InjectModel(TransactionSchemaName) private readonly transactionModel: Model<TransactionModel>,
  ) {}

  @MessagePattern({
    name: RabbitRoutingKeys.SellerNamePropagated,
    origin: 'rabbitmq',
  })
  public async onSellerNamePropagated(
    data?: {_id?: string, first_name?: string, last_name?: string, email?: string},
  ): Promise<void> {
    if (!data.email) {
      return;
    }

    const transactions: Array<{_id: string}> = await this.transactionModel.aggregate([{
      $lookup: {
        as: 'paymentflow',
        foreignField: 'id',
        from: PaymentFlowSchemaName,
        localField: 'payment_flow_id',
      },
    }, {
      $match: {
        'paymentflow.seller_email': data.email,
        sellerName: {$exists: false},
      },
    }, {
      $project: {_id: 1},
    }]);

    if (!transactions.length) {
      return;
    }

    const nameArray: Array<string|null|undefined> = [data.first_name, data.last_name];
    const sellerName: string = nameArray
      .filter((e?: string) => !!e)
      .join(' ');

    this.transactionModel.updateMany(
      {_id: {$in: transactions.map((e: {_id: string}) => e._id)}, sellerName: {$exists: false}},
      {sellerName},
    );
  }
}
