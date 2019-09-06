import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Command, Positional } from '@pe/nest-kit';
import { Model } from 'mongoose';
import { TransactionDoubleConverter } from '../converter';
import { ElasticSearchClient } from '../elasticsearch/elastic-search.client';
import { ElasticTransactionEnum } from '../enum';
import { TransactionBasicInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';

@Injectable()
export class TransactionsEsBusinessUpdateCommand {
  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<TransactionModel>,
    private readonly elasticSearchClient: ElasticSearchClient,
  ) {}

  @Command({
    command: 'transactions:es:business-update',
    describe: 'Update transactions ElasticSearch index for business.',
  })
  public async update(
    @Positional({
      name: 'business',
    }) business_uuid: string,
  ): Promise<void> {
    if (!business_uuid) {
      throw new Error('This command should run only with "business" option.');
    }

    const criteria: any = {};
    criteria.business_uuid = business_uuid;

    Logger.log(`Clearing "${business_uuid}" transactions from ElasticSearch.`);
    await this.elasticSearchClient.deleteByQuery(
      ElasticTransactionEnum.index,
      ElasticTransactionEnum.type,
      {
        query: {
          match: {
            business_uuid: business_uuid,
          },
        },
      },
    );
    Logger.log(`Clearing done.`);

    const count: number = await this.transactionsModel.countDocuments(criteria);
    Logger.log(`Found ${count} records.`);

    const limit: number = 1000;
    let start: number = 0;

    while (start < count) {
      const transactions: TransactionModel[] = await this.getWithLimit(start, limit, criteria);
      Logger.log(`${transactions.length} items parsed`);
      const processed: TransactionBasicInterface[] = [];

      for (const transaction of transactions) {
        processed.push(TransactionDoubleConverter.pack(transaction.toObject()));
      }

      await this.elasticSearchClient.bulkIndex(
        ElasticTransactionEnum.index,
        ElasticTransactionEnum.type,
        processed,
      );

      start += limit;
      Logger.log(`Exported ${start} of ${count}`);
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
