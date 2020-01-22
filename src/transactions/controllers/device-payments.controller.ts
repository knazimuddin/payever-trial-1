import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Model } from "mongoose";
import { InjectModel } from '@nestjs/mongoose';

import { RabbitRoutingKeys } from '../../enums';
import { TransactionSchemaName } from '../schemas';
import { TransactionModel } from '../models';

@Controller()
export class DevicePaymentsController {
  constructor(
    @InjectModel(TransactionSchemaName) private readonly transactionModel: Model<TransactionModel>,
  ) {}

  @MessagePattern({
    name: RabbitRoutingKeys.CodeUpdated,
  })
  public async onPaymentCodeUpdatedEvent(data: {flow: {payment: {_id: string}}, sellerName?: string}): Promise<void> {
    if (data.flow.payment._id && data.sellerName) {
      await this.transactionModel.findByIdAndUpdate(data.flow.payment._id, {sellerName: data.sellerName});
    }
  }
}
