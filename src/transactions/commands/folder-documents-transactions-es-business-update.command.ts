import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ElasticSearchClient } from '@pe/elastic-kit';
import { Command, Positional } from '@pe/nest-kit';
import { FolderDocumentsService } from '@pe/folders-plugin';
import { Model } from 'mongoose';
import { NewElasticTransactionEnum } from '../enum';
import { TransactionModel } from '../models';

@Injectable()
export class FolderDocumentsTransactionsEsBusinessUpdateCommand {
  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<TransactionModel>,
    private readonly folderDocumentsService: FolderDocumentsService,
    private readonly elasticSearchClient: ElasticSearchClient,
  ) { }

  @Command({
    command: 'folder-documents:transactions:es:business-update',
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

    const criteria: any = { };
    criteria.business_uuid = business_uuid;

    Logger.log(`Clearing "${business_uuid}" transactions from ElasticSearch.`);
    await this.elasticSearchClient.deleteByQuery(
      NewElasticTransactionEnum.index,
      {
        query: {
          match_phrase: {
            business_uuid: business_uuid,
          },
        },
      },
    );
    Logger.log(`Clearing done.`);

    const total: number = await this.transactionsModel.countDocuments(criteria);
    Logger.log(`Found ${total} records.`);

    const limit: number = 1000;
    let processed: number = 0;

    while (processed < total) {
      const transactions: TransactionModel[] = await this.getWithLimit(processed, limit, criteria);
      Logger.log(`Starting next ${transactions.length} transactions.`);
      const prepared: any = [];

      for (const transaction of transactions) {
        prepared.push(await this.folderDocumentsService.prepareIndexedFields(transaction));
      }

      await this.elasticSearchClient.bulkIndex(
        NewElasticTransactionEnum.index,
        prepared,
      );

      processed += transactions.length;
      Logger.log(`Exported ${processed} of ${total}.`);
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
