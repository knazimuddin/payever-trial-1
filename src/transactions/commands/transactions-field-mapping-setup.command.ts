import { Injectable } from '@nestjs/common';
import { Command } from '@pe/nest-kit';
import { ElasticSearchClient } from '../elasticsearch/elastic-search.client';
import { ElasticIndexingTextFieldsEnum, ElasticTransactionEnum } from '../enum';

@Injectable()
export class TransactionsFieldMappingSetupCommand {
  constructor(
    private readonly elasticSearchClient: ElasticSearchClient,
  ) {}

  @Command({
    command: 'transactions:field-mapping:setup',
    describe: 'Setup field-mapping transactions for ElasticSearch',
  })
  public async transactionsEsExport(): Promise<void> {
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
}
