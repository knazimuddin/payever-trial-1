import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Command, Positional } from '@pe/nest-kit';
import { Model } from 'mongoose';
import { ListQueryDto, PagingResultDto } from '../dto';
import { BusinessModel } from '../models';
import { BusinessSchemaName } from '../schemas';
import { ElasticSearchService, MongoSearchService } from '../services';
import { BusinessFilter } from '../tools';

@Injectable()
export class TransactionsEsCompareCommand {
  constructor(
    @InjectModel(BusinessSchemaName) private readonly businessModel: Model<BusinessModel>,
    private readonly elastic: ElasticSearchService,
    private readonly mongo: MongoSearchService,
  ) {}

  @Command({
    command: 'transactions:es:compare',
    describe: 'Compare transactions amount between elastic and mongo indexes.',
  })
  public async compare(
    @Positional({
      name: 'business',
    }) business_uuid: string,
  ): Promise<void> {
    const criteria: any = {};
    if (business_uuid) {
      criteria._id = business_uuid;
    }

    const count: number = await this.businessModel.countDocuments(criteria);
    const limit: number = 1000;
    let start: number = 0;

    while (start < count) {
      for (const business of await this.getWithLimit(start, limit, criteria)) {
        const listDto: ListQueryDto = new ListQueryDto();

        listDto.filters = BusinessFilter.apply(business.id, listDto.filters);
        listDto.currency = business.currency;

        const mongoResult: PagingResultDto = await this.mongo.getResult(listDto);
        const mongoAmount: number = mongoResult.pagination_data.amount;

        const elasticResult: PagingResultDto = await this.elastic.getResult(listDto);
        const elasticAmount: number = elasticResult.pagination_data.amount;

        if (Math.ceil(mongoAmount) !== Math.ceil(elasticAmount)) {
          Logger.log(
            `Business "${business.id}" has differences `
              + `between elastic (${elasticAmount}) `
              + `and mongo(${mongoAmount}) transactions amount.`,
          );
        } else if (business_uuid) {
          Logger.log(`Business "${business_uuid}" is equal.`);
        }
      }

      start += limit;
    }
  }

  private async getWithLimit(start: number, limit: number, criteria: any = {}): Promise<BusinessModel[]> {
    return this.businessModel.find(
      criteria,
      null,
      {
        limit: limit,
        skip: start,
        sort: { _id: 1 },
      },
    );
  }
}
