import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BusinessPaymentOptionService {

  constructor(@InjectModel('BusinessPaymentOptionSchema') private readonly model: Model<any>) {
  }

  public async count() {
    return this.model.count({}).exec();
  }

  public async createOrUpdate(bpo: any) {
    if (bpo.uuid) {
      bpo = this.wrap(bpo);
      const existing = await this.model.findOne({uuid: bpo.uuid});
      if (existing) {
        return this.model.findOneAndUpdate({uuid: bpo.uuid}, bpo);
      } else {
        return this.create(bpo);
      }
    }
  }

  public async findOneById(id: number) {
    return this.findOneByParams({id});
  }

  public async findOneByParams(params) {
    const bpo = await this.model.findOne(params);

    return bpo
      ? this.unwrap(bpo.toObject({virtuals: true}))
      : null
    ;
  }

  public async removeById(id: string) {
    return this.model.findOneAndRemove({id});
  }

  public unwrap(bpo) {
    if (bpo.options) {
      try {
        bpo.options = JSON.parse(bpo.options);
      } catch (e) {
        // nothing we should do
      }
    }

    return bpo;
  }

  private async create(bpo: any) {
    return this.model.create(bpo);
  }

  private wrap(bpo) {
    if (Array.isArray(bpo.credentials)) {
      bpo.credentials = {};
    }

    if (bpo.options) {
      try {
        bpo.options = JSON.stringify(bpo.options);
      } catch (e) {
        // nothing we should do
      }
    }

    return bpo;
  }
}
