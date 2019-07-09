import { Injectable } from '@nestjs/common';
import * as elasticsearch from 'elasticsearch';
import { environment } from '../../environments';

@Injectable()
export class ElasticSearchClient {
  private client = new elasticsearch.Client({
    host: environment.elasticSearch,
    log: 'error',
  });

  public async singleIndex(index: string, type: string, item: any, operation: string = 'index') {
    const bulkBody = [];
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
      .then(response => {
        console.log(JSON.stringify(response, null, 2));

        let errorCount = 0;
        for (const responseItem of response.items) {
          if (responseItem.index && responseItem.index.error) {
            console.log(++errorCount, responseItem.index.error);
          }
        }
      })
      .catch(console.log);
  }

  public async bulkIndex(index: string, type: string, data: any, operation: string = 'index') {
    const bulkBody = [];
    for (const item of data) {
      const plain = item.toObject();
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
      .then(response => {
        let errorCount = 0;
        for (const item of response.items) {
          if (item.index && item.index.error) {
            console.log(++errorCount, item.index.error);
          }
        }

        console.log(
          `Successfully indexed ${data.length - errorCount}
         out of ${data.length} items`,
        );
      })
      .catch(console.log)
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
      .then(response => console.log(response))
      .catch(console.log)
    ;
  }

  public async search(index: string, search: any): Promise<any> {
    return this.client
      .search({
        index: index,
        body: search,
      })
      .catch(console.log)
    ;
  }
}
