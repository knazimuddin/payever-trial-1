import { Injectable } from '@nestjs/common';
import { EventListener } from '@pe/nest-kit';
import { TransactionEventEnum } from '../enum/events';
import { TransactionModel } from '../models';
import { ElasticTransactionEnum } from '../enum';
import { TransactionDoubleConverter } from '../converter';
import { DelayRemoveClient, ElasticSearchClient } from '@pe/elastic-kit';

@Injectable()
export class TransactionElasticListener {
  constructor(
    private readonly elasticSearchClient: ElasticSearchClient,
    private readonly delayRemoveClient: DelayRemoveClient,
  ) { }

  @EventListener(TransactionEventEnum.TransactionCreated)
  public async transactionCreated(
    transaction: TransactionModel,
  ): Promise<void> {
    await this.indexTransaction(transaction);
  }

  @EventListener(TransactionEventEnum.TransactionUpdated)
  public async transactionUpdated(
    transaction: TransactionModel,
  ): Promise<void> {
    await this.indexTransaction(transaction);
  }

  @EventListener(TransactionEventEnum.TransactionDeleted)
  public async transactionDeleted(
    transactionId: string,
  ): Promise<void> {
    await this.delayRemoveClient.deleteByQuery(
      ElasticTransactionEnum.index,
      ElasticTransactionEnum.type,
      {
        query: {
          match_phrase: {
            uuid: transactionId,
          },
        },
      },
    );
  }

  private async indexTransaction(
    transaction: TransactionModel,
  ): Promise<void> {
    await this.elasticSearchClient.singleIndex(
      ElasticTransactionEnum.index,
      TransactionDoubleConverter.pack(transaction.toObject()),
    );
  }

}
