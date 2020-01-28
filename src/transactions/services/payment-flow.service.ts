import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentFlowInterface } from '../interfaces';
import { PaymentFlowModel } from '../models';
import { PaymentFlowDto } from '../dto/checkout-rabbit';

@Injectable()
export class PaymentFlowService {

  constructor(
    @InjectModel('PaymentFlow') private readonly model: Model<PaymentFlowModel>,
  ) {}

  public async createOrUpdate(flowDto: PaymentFlowDto): Promise<PaymentFlowModel> {
    return this.model.findOneAndUpdate(
      {id: flowDto.id},
      flowDto,
      {new: true, upsert: true},
    );
  }

  public async findOne(conditions: any): Promise<PaymentFlowModel> {
    return this.model.findOne(conditions);
  }

  public async findOneById(id: string): Promise<PaymentFlowModel> {
    return this.model.findOne({id});
  }

  public async removeById(id: string): Promise<void> {
    await this.model.findOneAndRemove({id});
  }
}
