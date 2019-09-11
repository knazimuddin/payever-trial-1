import { Logger } from '@nestjs/common';
import { ElasticSearchClient } from './elastic-search.client';

export class DelayRemoveClient {
  private retries: number = 0;
  private maxRetries: number = 10;
  private timeout: number = 1000;

  constructor(
    private readonly client: ElasticSearchClient,
    private readonly logger: Logger,
  ) {}

  public async deleteByQuery(index: string, type: string, search: any): Promise<void> {
    this.retries++;
    const deleted: number = await this.client.deleteByQuery(index, type, search);

    if (!deleted && this.retries < this.maxRetries) {
      this.logger.log({
        context: 'DelayRemoveClient',
        index: index,
        message: 'Planning new cycle of deletion.',
        query: search,

        attempt: this.retries,
      });

      const that: DelayRemoveClient = this;
      setTimeout(() => {
          that.deleteByQuery(index, type, search).then();
        },
        this.timeout,
      );
    }
  }
}
