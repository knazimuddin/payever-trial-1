import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessDto } from '../dto';
import { BusinessModel } from '../models';
import { BusinessSchemaName } from '../schemas';

export class BusinessService {
  constructor(
    @InjectModel(BusinessSchemaName) private readonly businessModel: Model<BusinessModel>,
  ) {}

  public async save(businessDto: BusinessDto): Promise<BusinessModel> {
    return this.businessModel.findOneAndUpdate(
      { _id: businessDto._id },
      {
        $set: {
          currency: businessDto.currency,
        },
      },
      { upsert: true, new: true },
    );
  }

  public async findBusinessById(businessId: string): Promise<BusinessModel> {
    return this.businessModel.findOne({
      _id: businessId,
    });
  }

  public async deleteOneById(id: string): Promise<void> {
    await this.businessModel.deleteOne({
      _id: id,
    });
  }
}
