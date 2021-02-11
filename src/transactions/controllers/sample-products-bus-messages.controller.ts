/* tslint:disable:no-identical-functions */
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { SampleProductPayloadDto } from '../dto';
import { TransactionsExampleService } from '../services';
import { RabbitChannels } from '../../enums';

@Controller()
export class SampleProductsBusMessagesController {
  constructor(
    private readonly logger: Logger,
    private readonly exampleService: TransactionsExampleService,
  ) { }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: 'products.event.sampleproduct.created',
  })
  public async onSampleProductsCreate(sampleProductsPayload: SampleProductPayloadDto): Promise<void> {
    this.logger.log({
      context: 'SampleProductsBusMessagesController',
      data: sampleProductsPayload,
      message: 'received a sample products created event',
    });

    await this.exampleService.createBusinessExamples(sampleProductsPayload.business, sampleProductsPayload.products);
  }
}
