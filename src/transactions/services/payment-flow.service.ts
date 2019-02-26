import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PaymentFlowService {

  constructor(
    @InjectModel('PaymentFlow') private readonly model: Model<any>,
  ) {}

  public async createOrUpdate(flow: any) {
    if (flow.id) {
      flow = this.wrap(flow);
      const existing = await this.model.findOne({id: flow.id});
      if (existing) {
        return this.model.findOneAndUpdate({id: flow.id}, flow);
      } else {
        return this.model.create(flow);
      }
    }
  }

  public async findOne(id: string) {
    return this.findOneByParams({id});
  }

  public async findOneByParams(params) {
    const flow = await this.model.findOne(params);

    return flow ? this.unwrap(flow.toObject({virtuals: true})) : null;
  }

  public async removeById(id: string) {
    return this.model.findOneAndRemove({id});
  }

  private async create(flow: any) {
    return this.model.create(flow);
  }

  private wrap(flow) {
    return flow;
  }

  private unwrap(flow) {
    return flow;
  }
}
