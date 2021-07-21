import { Injectable, Logger } from '@nestjs/common';
import { ElasticSearchClient } from '@pe/elastic-kit';
import { Command } from '@pe/nest-kit';
import { ElasticConfig } from '../../config';

@Injectable()
export class TransactionsEsSetupCommand {
  constructor(
    private readonly elasticSearchClient: ElasticSearchClient,
  ) { }

  @Command({
    command: 'transactions:es:setup',
    describe: 'Setup field-mapping transactions for ElasticSearch',
  })
  public async setup(): Promise<void> {
    if (!await this.elasticSearchClient.isIndexExists(ElasticConfig.index.collection)) {
      Logger.log(`Creating index.`);
      await this.elasticSearchClient.createIndex(ElasticConfig.index.collection);
    }

    await this.elasticSearchClient.putIndexSettings(
      ElasticConfig.index.collection,
      {
        index: {
          max_result_window: 500000,
          refresh_interval: null,
        },
      },
    );

    for (const field in ElasticConfig.fieldsMapping) {
      if (ElasticConfig.fieldsMapping[field]) {
        await this.elasticSearchClient.setupFieldMapping(
          ElasticConfig.index.collection,
          field,
          ElasticConfig.fieldsMapping[field],
        );
      }
    }
  }
}
