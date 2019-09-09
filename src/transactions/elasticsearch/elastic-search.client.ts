import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'elasticsearch';
import { environment } from '../../environments';

@Injectable()
export class ElasticSearchClient {
  private client: Client = new Client({
    deadTimeout: 60000,
    host: environment.elasticSearch,
    log: 'error',
  });

  constructor(
    private readonly logger: Logger,
  ) {}

  public async singleIndex(index: string, type: string, item: any): Promise<void> {
    const bulkBody: any = [];
    item.mongoId = item._id;
    delete item._id;
    bulkBody.push({
      update: {
        _id: item.mongoId,
        _index: index,
        _type: type,
      },
    });

    bulkBody.push({
      doc: item,
      doc_as_upsert : true,
    });

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
        error: e,
        message: `Error on ElasticSearch request`,
      }))
    ;
  }

  public async bulkIndex(index: string, type: string, data: any[]): Promise<void> {
    const bulkBody: any = [];
    for (const item of data) {
      const itemId: string = item._id;
      item.mongoId = item._id;
      delete item._id;

      bulkBody.push({
        update: {
          _id: itemId,
          _index: index,
          _type: type,
        },
      });

      bulkBody.push({
        doc: item,
        doc_as_upsert : true,
      });
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
          error: e,
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
          error: e,
          message: `Error on ElasticSearch request`,
        },
      ))
    ;
  }

  public async deleteByQuery(index: string, type: string, search: any): Promise<any> {
    return this.client
      .deleteByQuery({
        body: search,
        index: index,
        type: type,
      })
      .catch((e: any) => this.logger.error(
        {
          context: 'ElasticSearchClient',
          error: e,
          message: `Error on ElasticSearch request`,
        },
      ))
    ;
  }

  public async createIndex(index: string): Promise<any> {
    return this.client.indices
      .create({
        index: index,
      })
      .catch((e: any) => this.logger.error(
        {
          context: 'ElasticSearchClient',
          error: e,
          message: `Error on ElasticSearch request`,
        },
      ));
  }

  public async isIndexExists(index: string): Promise<any> {
    return this.client.indices
      .exists({
        index: index,
      })
      .catch((e: any) => this.logger.error(
        {
          context: 'ElasticSearchClient',
          error: e,
          message: `Error on ElasticSearch request`,
        },
      ));
  }

  public async setupFieldMapping(index: string, type: string, field: string, config: {}): Promise<void> {
    return this.client.indices
      .putMapping({
        index: index,
        type: type,

        body: {
          properties: {
            [field]: config,
          },
        },
      })
      .then((response: any) => this.logger.log({
        context: 'ElasticSearchClient',
        field: field,
        index: index,
        response: response,
        type: type,
      }))
      .catch((e: any) => this.logger.error({
        context: 'ElasticSearchClient',
        error: e,
        message: `Error on ElasticSearch request`,
      }));
  }
}
