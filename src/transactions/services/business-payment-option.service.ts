import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessPaymentOptionInterface } from '../interfaces';
import { BusinessPaymentOptionModel } from '../models';

@Injectable()
export class BusinessPaymentOptionService {

  constructor(
    @InjectModel('BusinessPaymentOption') private readonly model: Model<BusinessPaymentOptionModel>,
    private readonly logger: Logger,
  ) { }

  public async createOrUpdate(
    businessPaymentOptionDto: BusinessPaymentOptionInterface,
  ): Promise<BusinessPaymentOptionModel> {
    await this.model.updateOne(
      {
        id: businessPaymentOptionDto.id,
      },
      {
        $set: this.wrap(businessPaymentOptionDto),
      },
      {
        new: true,
        upsert: true,
      },
    );

    return this.findOneById(businessPaymentOptionDto.id);
  }

  public async findOneByBusinessAndPaymentType(
    businessUuid: string,
    paymentType: string,
  ): Promise<BusinessPaymentOptionModel> {
    return this.model.findOne({
      business_uuid: businessUuid,
      payment_method: paymentType,
    });
  }

  public async findOneById(id: number): Promise<BusinessPaymentOptionModel> {
    const bpo: BusinessPaymentOptionModel = await this.model.findOne({ id });

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
        this.logger.warn({
          bpo: bpo,
          context: 'BusinessPaymentOptionService',
          message: 'Error during BPO options unwrap',
        });
      }
    }

    return bpo;
  }

  private wrap(bpo: BusinessPaymentOptionInterface): BusinessPaymentOptionInterface {
    if (Array.isArray(bpo.credentials)) {
      bpo.credentials = { };
    }

    if (bpo.options) {
      try {
        bpo.options = JSON.stringify(bpo.options);
      } catch (e) {
        this.logger.warn({
          bpo: bpo,
          context: 'BusinessPaymentOptionService',
          message: 'Error during BPO options wrap',
        });
      }
    }

    return bpo;
  }
}
