import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessPaymentOptionInterface } from '../interfaces';
import { BusinessPaymentOptionModel } from '../models';

@Injectable()
export class BusinessPaymentOptionService {

  constructor(
    @InjectModel('BusinessPaymentOption') private readonly model: Model<BusinessPaymentOptionModel>,
  ) {}

  public async createOrUpdate(
    businessPaymentOption: BusinessPaymentOptionInterface,
  ): Promise<BusinessPaymentOptionModel> {
    const dto = {
      // _id: businessPaymentOption.uuid,
      ...businessPaymentOption,
    };

    await this.model.updateOne(
      {
        uuid: businessPaymentOption.uuid,
      },
      {
        $setOnInsert: {
          // _id: businessPaymentOption.uuid,
        },
        $set: this.wrap(dto),
      },
      {
        upsert: true,
        new: true,
      },
    );

    return this.model.findOne({ uuid: businessPaymentOption.uuid });
  }

  public async findOneById(id: number): Promise<BusinessPaymentOptionModel> {
    const bpo: BusinessPaymentOptionModel = await this.model.findOne({id});

    return bpo
      ? this.unwrap(bpo.toObject({ virtuals: true }))
      : null
    ;
  }

  private unwrap(bpo: BusinessPaymentOptionModel): BusinessPaymentOptionModel {
    if (bpo.options) {
      try {
        bpo.options = JSON.parse(bpo.options);
      } catch (e) {
        // nothing we should do
      }
    }

    return bpo;
  }

  private wrap(bpo: BusinessPaymentOptionInterface): BusinessPaymentOptionInterface {
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
