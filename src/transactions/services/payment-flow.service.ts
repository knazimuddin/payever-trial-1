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

    if (await this.model.findOne({ id: flowDto.id })) {
      delete flowDto.id;
      await this.model.findOneAndUpdate(
        {
          id: flowDto.id,
        },
        flowDto,
      );
    } else {
      await this.model.create(dto);
    }

    return this.model.findOne({ id: flowDto.id });
  }

  public async findOneById(id: string): Promise<PaymentFlowModel> {
    return this.model.findOne({id});
  }

  public async removeById(id: string): Promise<void> {
    await this.model.findOneAndRemove({id});
  }
}
