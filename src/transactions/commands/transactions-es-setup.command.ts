import { Injectable, Logger } from '@nestjs/common';
import { Command } from '@pe/nest-kit';
import { ElasticSearchClient } from '../elasticsearch/elastic-search.client';
import { ElasticMappingFieldsConfig, ElasticTransactionEnum } from '../enum';

@Injectable()
export class TransactionsEsSetupCommand {
  constructor(
    private readonly elasticSearchClient: ElasticSearchClient,
  ) {}

  @Command({
    command: 'transactions:es:setup',
    describe: 'Setup field-mapping transactions for ElasticSearch',
  })
  public async setup(): Promise<void> {
    if (!await this.elasticSearchClient.isIndexExists(ElasticTransactionEnum.index)) {
      Logger.log(`Creating index.`);
      await this.elasticSearchClient.createIndex(ElasticTransactionEnum.index);
    }

    for (const field in ElasticMappingFieldsConfig) {
      if (ElasticMappingFieldsConfig[field]) {
        await this.elasticSearchClient.setupFieldMapping(
          ElasticTransactionEnum.index,
          ElasticTransactionEnum.type,
          field,
          ElasticMappingFieldsConfig[field],
        );
      }
    }
  }
}
