import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'elasticsearch';
import { environment } from '../../environments';
import { TransactionBasicInterface } from '../interfaces/transaction';

@Injectable()
export class ElasticSearchClient {
  private client: Client = new Client({
    host: environment.elasticSearch,
    log: 'error',
  });

  constructor(
    private readonly logger: Logger,
  ) {}

  public async singleIndex(index: string, type: string, item: any, operation: string = 'index'): Promise<void> {
    const bulkBody: any = [];
    item.mongoId = item._id;
    delete item._id;
    bulkBody.push({
      [operation]: {
        _id: item.mongoId,
        _index: index,
        _type: type,
      },
    });

    if (operation === 'update') {
      bulkBody.push({doc: item});
    } else {
      bulkBody.push(item);
    }

    await this.client
      .bulk({ body: bulkBody })
      .then((response: any) => {
        this.logger.log({
          context: 'ElasticSearchClient',
          response: JSON.stringify(response, null, 2),
        });

        let errorCount: number = 0;
        for (const responseItem of response.items) {
          if (responseItem.index && responseItem.index.error) {
            this.logger.log({
              context: 'ElasticSearchClient',
              response: {
                error: responseItem.index.error,
                errorCount: ++errorCount,
              },
            });
          }
        }
      })
      .catch((e: any) => this.logger.error({
        context: 'ElasticSearchClient',
        error: e.message,
        message: `Error on ElasticSearch request`,
      }))
    ;
  }

  public async bulkIndex(index: string, type: string, data: any, operation: string = 'index'): Promise<void> {
    const bulkBody: any = [];
    for (const item of data) {
      const plain: TransactionBasicInterface & { _id: string, mongoId: string } = item.toObject();
      plain.mongoId = item._id;
      delete plain._id;

      bulkBody.push({
        [operation]: {
          _id: item._id,
          _index: index,
          _type: type,
        },
      });

      bulkBody.push(plain);
    }

    if (!bulkBody.length) {
      return;
    }

    await this.client
      .bulk({ body: bulkBody })
      .then((response: any) => {
        let errorCount: number = 0;
        for (const item of response.items) {
          if (item.index && item.index.error) {
            this.logger.log({
              context: 'ElasticSearchClient',
              response: {
                error: item.index.error,
                errorCount: ++errorCount,
              },
            });
          }
        }

        this.logger.log({
          context: 'ElasticSearchClient',
          message: `Successfully indexed ${data.length - errorCount} out of ${data.length} items`,
        });
      })
      .catch((e: any) => this.logger.error(
        {
          context: 'ElasticSearchClient',
          error: e.message,
          message: `Error on ElasticSearch request`,
        },
      ))
    ;
  }

  public async setupFieldMapping(index: string, type: string, field: string): Promise<void> {
    return this.client.indices
      .putMapping({
        index: index,
        type: type,

        body: {
          properties: {
            [field]: {
              fielddata: true,
              type: 'text',
            },
          },
        },
      })
      .then((response: any) => this.logger.log({
        context: 'ElasticSearchClient',
        response: response,
      }))
      .catch((e: any) => this.logger.error(
        {
          context: 'ElasticSearchClient',
          error: e.message,
          message: `Error on ElasticSearch request`,
        },
      ))
    ;
  }

  public async search(index: string, search: any): Promise<any> {
    return this.client
      .search({
        body: search,
        index: index,
      })
      .catch((e: any) => this.logger.error(
        {
          context: 'ElasticSearchClient',
          error: e.message,
          message: `Error on ElasticSearch request`,
        },
      ))
    ;
  }
}
