import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ElasticSearchClient } from '@pe/elastic-kit';
import { Command, Positional } from '@pe/nest-kit';
import { Model } from 'mongoose';
import * as readline from 'readline';
import { ListQueryDto, PagingResultDto } from '../dto';
import { ElasticTransactionEnum } from '../enum';
import { TransactionBasicInterface } from '../interfaces/transaction';
import { BusinessModel, TransactionModel } from '../models';
import { BusinessSchemaName, TransactionSchemaName } from '../schemas';
import { ElasticSearchService } from '../services';
import { BusinessFilter } from '../tools';

@Injectable()
export class TransactionsEsBusinessCheckCommand {
  constructor(
    @InjectModel(TransactionSchemaName) private readonly transactionsModel: Model<TransactionModel>,
    @InjectModel(BusinessSchemaName) private readonly businessModel: Model<BusinessModel>,
    private readonly elasticSearchService: ElasticSearchService,
    private readonly elasticSearchClient: ElasticSearchClient,
  ) { }

  @Command({
    command: 'transactions:es:business-check',
    describe: 'Track ElasticSearch transactions index for business.',
  })
  public async check(
    @Positional({
      name: 'business',
    }) business_uuid: string,
    @Positional({
      name: 'after',
    }) after: string,
  ): Promise<void> {
    if (!business_uuid) {
      throw new Error('This command should run only with "business" option.');
    }

    const business: BusinessModel = await this.getBusiness(business_uuid);

    const listDto: ListQueryDto = new ListQueryDto();
    listDto.filters = BusinessFilter.apply(business.id, listDto.filters);
    listDto.currency = business.currency;

    if (after) {
      listDto.filters.created_at = [{
        condition: 'afterDate',
        value: [new Date(after)],
      }];
    }

    listDto.limit = 1000;

    const general: PagingResultDto = await this.elasticSearchService.getResult(listDto);
    Logger.log(`Elastic contains ${general.pagination_data.total} records.`);

    const total: number = general.pagination_data.total;
    let processed: number = 0;

    while (processed < total) {
      const result: PagingResultDto = await this.elasticSearchService.getResult(listDto);
      const transactions: TransactionBasicInterface[] = result.collection;
      Logger.log(`Starting next ${transactions.length} transactions.`);

      for (const transaction of transactions) {
        Logger.log(`${transaction.uuid}`);

        listDto.filters.uuid = [{
          condition: 'is',
          value: [transaction.uuid],
        }];

        const mongoTransaction: TransactionBasicInterface = await this.transactionsModel.findOne({
          uuid: transaction.uuid,
        }).exec();

        if (!mongoTransaction) {
          readline.moveCursor(process.stdout, 0, -1);
          Logger.log(`Transaction ${transaction.uuid} is not in mongo. Removing...`);

          await this.elasticSearchClient.deleteByQuery(
            ElasticTransactionEnum.index,
            {
              query: {
                match_phrase: {
                  uuid: transaction.uuid,
                },
              },
            },
          );
          readline.moveCursor(process.stdout, 0, 1);
        }

        readline.moveCursor(process.stdout, 0, -1);
        readline.clearLine(process.stdout, 0);
      }

      delete listDto.filters.uuid;

      processed += transactions.length;
      listDto.page++;

      Logger.log(`Checked ${processed} of ${total}.`);
    }
  }

  private async getBusiness(id: string): Promise<BusinessModel> {
    return this.businessModel.findOne(
      {
        _id: id,
      },
    );
  }
}
