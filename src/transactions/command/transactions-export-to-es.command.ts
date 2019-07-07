import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Command } from '@pe/nest-kit';
import { Model } from 'mongoose';
import { ElasticSearchClient } from '../elasticsearch/elastic-search.client';
import { ElasticIndexingTextFieldsEnum, ElasticTransactionEnum } from '../enum';

@Injectable()
export class TransactionsEsExportCommand {
  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<any>,
    private readonly elasticSearchClient: ElasticSearchClient,
  ) {}

  @Command({ command: 'transactions:export:es', describe: 'Export transactions for widgets' })
  public async transactionsEsExport() {
    const count: number = await this.transactionsModel.countDocuments();
    const limit: number = 200;
    let start: number = 0;

    while (start < count) {
      const transactions = await this.getWithLimit(start, limit);
      start += limit;
      console.log(`${transactions.length} items parsed`);
      await this.elasticSearchClient.bulkIndex(
        ElasticTransactionEnum.index,
        ElasticTransactionEnum.type,
        transactions,
      );

      console.log(`Exported ${start} of ${count}`);
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

  private async getWithLimit(start: number, limit: number): Promise<any[]> {
    return this.transactionsModel.find(
      {},
      null,
      {
        sort: { _id: 1 },
        skip: start,
        limit: limit,
      },
    );
  }
}
