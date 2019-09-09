import { ApiResponse, Client } from '@elastic/elasticsearch';
import { Injectable, Logger } from '@nestjs/common';
import { environment } from '../../environments';

@Injectable()
export class ElasticSearchClient {
  private client: Client;

  constructor(
    private readonly logger: Logger,
  ) {
    this.client = new Client({
      node: environment.elasticSearch,

      maxRetries: 10,
      requestTimeout: 60000,
      suggestCompression: true,
    });
  }

  public async singleIndex(index: string, type: string, record: any): Promise<void> {
    const bulkBody: any = [];
    const doc: any = Object.assign({}, record);
    doc.mongoId = doc._id;
    delete doc._id;
    bulkBody.push({
      update: {
        _id: doc.mongoId,
        _index: index,
        _type: type,
      },
    });

    bulkBody.push({
      doc: doc,
      doc_as_upsert : true,
    });

    await this.client
      .bulk({ body: bulkBody })
      .then((response: ApiResponse<any>) => {
        if (response.body.errors) {
          const item: any = response.body.items.shift();
          if (item.update && item.update.error) {
            this.logger.error({
              context: 'ElasticSearchClient',
              message: `Error on ElasticSearch singleIndex request`,
              response: {
                error: item.update.error,
                index: item.update.index,
                itemId: item.update._id,
                result: item.update.result,
              },
            });
          }
        } else {
          this.logger.log({
            context: 'ElasticSearchClient',
            item: record,
            message: `Successfully indexed item`,
          });
        }
      })
      .catch((e: any) => this.logger.error({
        context: 'ElasticSearchClient',
        error: e,
        item: record,
        message: `Error on ElasticSearch singleIndex request`,
      }))
    ;
  }

  public async bulkIndex(index: string, type: string, records: any[]): Promise<void> {
    const bulkBody: any = [];
    for (const record of records) {
      const doc: any = Object.assign({}, record);
      const itemId: string = doc._id;
      doc.mongoId = doc._id;
      delete doc._id;

      bulkBody.push({
        update: {
          _id: itemId,
          _index: index,
          _type: type,
        },
      });

      bulkBody.push({
        doc: doc,
        doc_as_upsert : true,
      });
    }

    if (!bulkBody.length) {
      return;
    }

    await this.client
      .bulk({ body: bulkBody })
      .then((response: ApiResponse<any>) => {
        let errorCount: number = 0;
        if (response.body.errors) {
          for (const item of response.body.items) {
            if (item.update && item.update.error) {
              this.logger.error({
                context: 'ElasticSearchClient',
                message: `Error on ElasticSearch bulkIndex request`,
                response: {
                  error: item.update.error,
                  index: item.update.index,
                  itemId: item.update._id,
                  result: item.update.result,
                },
              });
            }
            errorCount++;
          }
        }

        this.logger.log({
          context: 'ElasticSearchClient',
          message: `Successfully indexed ${response.body.items.length - errorCount} `
           + `out of ${response.body.items.length} items`,
        });
      })
      .catch((e: any) => this.logger.error({
        context: 'ElasticSearchClient',
        error: e,
        message: `Error on ElasticSearch bulkIndex request`,
      }))
    ;
  }

  public async search(index: string, search: any): Promise<any> {
    return this.client
      .search({
        body: search,
        index: index,
      })
      .catch((e: any) => this.logger.error({
        context: 'ElasticSearchClient',
        error: e,
        message: `Error on ElasticSearch search request`,
        request: search,
      }));
  }

  public async deleteByQuery(index: string, type: string, search: any): Promise<any> {
    return this.client
      .deleteByQuery({
        body: search,
        index: index,
        type: type,
      })
      .then((response: ApiResponse<any>) => {
        this.logger.log({
          context: 'ElasticSearchClient',
          index: index,
          message: 'Result of ElasticSearch deleteByQuery request',
          query: search,
          result: {
            deleted: response.body.deleted,
            total: response.body.total,
          },
        });

        this.client.close();
      })
      .catch((e: any) => this.logger.error({
        context: 'ElasticSearchClient',
        error: e,
        message: `Error on ElasticSearch deleteByQuery request`,
        request: search,
      }));
  }

  public async createIndex(index: string): Promise<any> {
    return this.client.indices
      .create({
        index: index,
      })
      .catch((e: any) => this.logger.error({
        context: 'ElasticSearchClient',
        error: e,
        indexName: index,
        message: `Error on ElasticSearch createIndex request`,
      }));
  }

  public async isIndexExists(index: string): Promise<any> {
    return this.client.indices
      .exists({
        index: index,
      })
      .catch((e: any) => this.logger.error({
        context: 'ElasticSearchClient',
        error: e,
        message: `Error on ElasticSearch isIndexExists request`,
      }));
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
      .then((response: ApiResponse<any>) => this.logger.log({
        context: 'ElasticSearchClient',
        field: field,
        index: index,
        response: response,
        type: type,
      }))
      .catch((e: any) => this.logger.error({
        context: 'ElasticSearchClient',
        error: e,
        message: `Error on ElasticSearch setupFieldMapping request`,
      }));
  }
}
