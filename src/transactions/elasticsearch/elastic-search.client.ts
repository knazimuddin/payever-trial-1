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

  public async singleIndex(index: string, type: string, item: any, operation: string = 'index'): Promise<void> {
    const bulkBody: any = [];
    item.mongoId = item._id;
    delete item._id;
    bulkBody.push({
      [operation]: {
        _index: index,
        _type: type,
        _id: item.mongoId,
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
        Logger.log(JSON.stringify(response, null, 2));

        let errorCount: number = 0;
        for (const responseItem of response.items) {
          if (responseItem.index && responseItem.index.error) {
            Logger.log(++errorCount, responseItem.index.error);
          }
        }
      })
      .catch(Logger.log);
  }

  public async bulkIndex(index: string, type: string, data: any, operation: string = 'index'): Promise<void> {
    const bulkBody: any = [];
    for (const item of data) {
      const plain: TransactionBasicInterface & { _id: string, mongoId: string } = item.toObject();
      plain.mongoId = item._id;
      delete plain._id;

      bulkBody.push({
        [operation]: {
          _index: index,
          _type: type,
          _id: item._id,
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
            Logger.log(++errorCount, item.index.error);
          }
        }

        Logger.log(
          `Successfully indexed ${data.length - errorCount} out of ${data.length} items`,
        );
      })
      .catch(Logger.log)
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
              type: 'text',
              fielddata: true,
            },
          },
        },
      })
      .then((response: any) => Logger.log(response))
      .catch(Logger.log)
    ;
  }

  public async search(index: string, search: any): Promise<any> {
    return this.client
      .search({
        index: index,
        body: search,
      })
      .catch(Logger.log)
    ;
  }
}
