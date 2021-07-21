import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ElasticSearchClient } from '@pe/elastic-kit';
import { Command, Positional } from '@pe/nest-kit';
import { Model } from 'mongoose';
import * as readline from 'readline';
import { ListQueryDto, PagingResultDto } from '../dto';
import { TransactionBasicInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { TransactionSchemaName } from '../schemas';
import { ElasticSearchService } from '@pe/folders-plugin';
import { ElasticConfig } from '../../config';

@Injectable()
export class TransactionsEsFixDiffCommand {
  constructor(
    @InjectModel(TransactionSchemaName) private readonly transactionsModel: Model<TransactionModel>,
    private readonly elasticSearchService: ElasticSearchService,
    private readonly elasticSearchClient: ElasticSearchClient,
  ) { }

  @Command({
    command: 'transactions:es:fix-diff',
    describe: 'Remove ElasticSearch transactions that are not presented in mongo',
  })
  public async check(
    @Positional({
      name: 'after',
    }) after: string,
    @Positional({
      name: 'before',
    }) before: string,
  ): Promise<void> {
    const listDto: ListQueryDto = new ListQueryDto();
    listDto.orderBy = 'created_at';
    listDto.direction = 'asc';

    const createdAtFilter: any[] = [];

    if (after) {
      createdAtFilter.push({
        condition: 'afterDate',
        value: [new Date(after)],
      });
    }

    if (before) {
      createdAtFilter.push({
        condition: 'beforeDate',
        value: [new Date(before)],
      });
    }

    if (createdAtFilter.length) {
      listDto.filters.created_at = createdAtFilter;
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
        });

        if (!mongoTransaction) {
          readline.moveCursor(process.stdout, 0, -1);
          Logger.log(`Transaction ${transaction.uuid} is not in mongo. Removing...`);

          await this.elasticSearchClient.deleteByQuery(
            ElasticConfig.index.collection,
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
}
