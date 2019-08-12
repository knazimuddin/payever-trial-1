import { InjectModel } from '@nestjs/mongoose';
import { BusinessCurrencySchemaName } from '../schemas';
import { Model } from 'mongoose';
import { BusinessCurrencyModel } from '../models';
import { BusinessCurrencyDto } from '../dto';

export class BusinessCurrencyService {
  constructor(
    @InjectModel(BusinessCurrencySchemaName) private readonly businessCurrencyModel: Model<BusinessCurrencyModel>,
  ) {}

  public async save(currencyDto: BusinessCurrencyDto): Promise<BusinessCurrencyModel> {
    return this.businessCurrencyModel.findOneAndUpdate(
      { _id: currencyDto._id },
      {
        $set: {
          currency: currencyDto.currency,
        },
      },
      { upsert: true, new: true },
    );
  }

  public async getBusinessCurrency(businessId: string): Promise<BusinessCurrencyModel> {
    return this.businessCurrencyModel.findOne({
      _id: businessId,
    });
  }

  public async deleteOneById(id: string): Promise<void> {
    this.businessCurrencyModel.deleteOne({
      _id: id,
    });
  }
}
