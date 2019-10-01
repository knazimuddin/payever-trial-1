import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Command, Positional } from '@pe/nest-kit';
import { Model } from 'mongoose';
import * as readline from 'readline';
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

    const total: number = await this.businessModel.countDocuments(criteria);
    const limit: number = 1000;
    let processed: number = 0;

    while (processed < total) {
      const businesses: BusinessModel[] = await this.getWithLimit(processed, limit, criteria);
      Logger.log(`Starting next ${businesses.length} businesses.`);
      for (const business of businesses) {
        Logger.log(business.id);
        const listDto: ListQueryDto = new ListQueryDto();

        listDto.filters = BusinessFilter.apply(business.id, listDto.filters);
        listDto.currency = business.currency;

        const mongoResult: PagingResultDto = await this.mongo.getResult(listDto);
        const mongoAmount: number = mongoResult.pagination_data.amount;
        const mongoTotal: number = mongoResult.pagination_data.total;

        const elasticResult: PagingResultDto = await this.elastic.getResult(listDto);
        const elasticAmount: number = elasticResult.pagination_data.amount;
        const elasticTotal: number = elasticResult.pagination_data.total;

        if (Math.ceil(mongoAmount) !== Math.ceil(elasticAmount) && mongoTotal !== elasticTotal) {
          readline.moveCursor(process.stdout, 0, -1);
          Logger.log(
            `Business "${business.id}" has differences`
              + `\n elastic: transactions ${elasticTotal}, amount ${elasticAmount}`
              + `\n mongo  : transactions ${mongoTotal}, amount ${mongoAmount}`
              + `\n`,
          );
        } else if (business_uuid) {
          Logger.log(`Business "${business_uuid}" is equal.`);
        }

        readline.moveCursor(process.stdout, 0, -1);
        readline.clearLine(process.stdout, 0);
      }

      processed += businesses.length;
    }

    Logger.log(`Compared ${processed} of ${total}.`);
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
