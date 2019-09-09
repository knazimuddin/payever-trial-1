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
      .then((response: any) => {
        if (response.errors) {
          const item: any = response.items.shift();
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
      .then((response: any) => {
        let errorCount: number = 0;
        if (response.errors) {
          for (const item of response.items) {
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
          message: `Successfully indexed ${response.items.length - errorCount} out of ${response.items.length} items`,
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
      .then((response: any) => this.logger.log({
        context: 'ElasticSearchClient',
        index: index,
        message: 'Result of ElasticSearch deleteByQuery request',
        query: search,
        result: {
          deleted: response.deleted,
          total: response.total,
        },
      }))
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
        message: `Error on ElasticSearch request`,
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
