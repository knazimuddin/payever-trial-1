import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Command, Positional } from '@pe/nest-kit';
import { Model } from 'mongoose';
import { ElasticSearchClient } from '../elasticsearch/elastic-search.client';
import { ElasticIndexingTextFieldsEnum, ElasticTransactionEnum } from '../enum';
import { TransactionModel } from '../models';

@Injectable()
export class TransactionsEsExportCommand {
  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<any>,
    private readonly elasticSearchClient: ElasticSearchClient,
  ) {}

  @Command({ command: 'transactions:export:es', describe: 'Export transactions for widgets' })
  public async transactionsEsExport(
    @Positional({
      name: 'after',
      type: 'string',
    }) after: string,
    @Positional({
      name: 'before',
      type: 'string',
    }) before: string,
  ): Promise<void> {
    const criteria: any = {};
    if (before || after) {
      criteria.created_at = {};
    }
    if (before) {
      criteria.created_at.$lte = new Date(before);
    }
    if (after) {
      criteria.created_at.$gte = new Date(after);
    }

    const count: number = await this.transactionsModel.countDocuments(criteria);
    Logger.log(`Found ${count} records.`);

    const limit: number = 200;
    let start: number = 0;

    while (start < count) {
      const transactions: TransactionModel[] = await this.getWithLimit(start, limit, criteria);
      start += limit;
      Logger.log(`${transactions.length} items parsed`);
      await this.elasticSearchClient.bulkIndex(
        ElasticTransactionEnum.index,
        ElasticTransactionEnum.type,
        transactions,
      );

      Logger.log(`Exported ${start} of ${count}`);
    }

    for (const item in ElasticIndexingTextFieldsEnum) {
      if (ElasticIndexingTextFieldsEnum[item]) {
        await this.elasticSearchClient.setupFieldMapping(
          ElasticTransactionEnum.index,
          ElasticTransactionEnum.type,
          ElasticIndexingTextFieldsEnum[item],
        );
      }
    }
  }

  private async getWithLimit(start: number, limit: number, criteria: any): Promise<any[]> {
    return this.transactionsModel.find(
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
