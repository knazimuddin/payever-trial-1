import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentFlowInterface } from '../interfaces';
import { PaymentFlowModel } from '../models';

@Injectable()
export class PaymentFlowService {

  constructor(
    @InjectModel('PaymentFlow') private readonly model: Model<PaymentFlowModel>,
  ) {}

  public async createOrUpdate(flowDto: PaymentFlowInterface): Promise<PaymentFlowModel> {
    const dto = {
      // _id: flowDto.id,
      ...flowDto,
    };

    await this.model.updateOne(
      {
        id: flowDto.id,
      },
      {
        $setOnInsert: {
          // _id: flowDto.id,
        },
        $set: dto,
      },
      {
        upsert: true,
      },
    );

    return this.findOneById(flowDto.id);
  }

  public async findOneById(id: string): Promise<PaymentFlowModel> {
    const flow: PaymentFlowModel = await this.model.findOne({id});

    return flow
      ? flow.toObject({ virtuals: true })
      : null
    ;
  }

  public async removeById(id: string): Promise<void> {
    await this.model.findOneAndRemove({id});
  }
}
