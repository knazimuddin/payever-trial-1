import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PaymentFlowService {

  constructor(@InjectModel('PaymentFlowSchema') private readonly model: Model<any>) {
  }

  async createOrUpdate(flow: any) {
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

  async findOne(id: string) {
    return await this.findOneByParams({id});
  }

  async findOneByParams(params) {
    const flow = await this.model.findOne(params);
    return flow ? this.unwrap(flow.toObject({virtuals: true})) : null;
  }

  async removeById(id: string) {
    return this.model.findOneAndRemove({id});
  }

  private async create(flow: any) {
    return await this.model.create(flow);
  }

  private wrap(flow) {
    return flow;
  }

  private unwrap(flow) {
    return flow;
  }

}
