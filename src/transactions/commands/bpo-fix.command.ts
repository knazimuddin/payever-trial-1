import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Command } from '@pe/nest-kit';
import { Model } from 'mongoose';
import { BusinessPaymentOptionModel } from '../models';

@Injectable()
export class BpoFixCommand {
  constructor(
    @InjectModel('BusinessPaymentOption') private readonly bpoModel: Model<BusinessPaymentOptionModel>,
  ) {}

  @Command({ command: 'bpo:fix', describe: 'Fix BPO _ids' })
  public async transactionsEsExport(): Promise<void> {
    const count: number = await this.bpoModel.countDocuments();
    Logger.log(`Found ${count} records.`);

    const limit: number = 200;
    let start: number = 0;

    while (start < count) {
      const bpos: BusinessPaymentOptionModel[] = await this.getWithLimit(start, limit);
      start += limit;
      Logger.log(`${bpos.length} items taken`);

      for (const bpo of bpos) {
        const data: BusinessPaymentOptionModel = bpo.toObject();

        if (!data._id) {
          Logger.log(data);

          await this.bpoModel.findOneAndRemove({ id: data.id });
          await this.bpoModel.create(data);
        }
      }

      Logger.log(`Converted ${start} of ${count}`);
    }
  }

  private async getWithLimit(start: number, limit: number): Promise<BusinessPaymentOptionModel[]> {
    return this.bpoModel.find(
      {},
      null,
      {
        limit: limit,
        skip: start,
        sort: { _id: 1 },
      },
    );
  }
}
