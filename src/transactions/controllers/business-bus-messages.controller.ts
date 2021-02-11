/* tslint:disable:no-identical-functions */
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { BusinessDto, RemoveBusinessDto } from '../dto';
import { BusinessService, TransactionsExampleService } from '../services';
import { RabbitChannels } from '../../enums';

@Controller()
export class BusinessBusMessagesController {
  constructor(
    private readonly logger: Logger,
    private readonly businessService: BusinessService,
    private readonly exampleService: TransactionsExampleService,
  ) { }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: 'users.event.business.created',
  })
  public async onBusinessCreate(businessDto: BusinessDto): Promise<void> {
    this.logger.log({
      context: 'BusinessBusMessagesController',
      data: businessDto,
      message: 'received a business created event',
    });

    await this.businessService.save(businessDto);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: 'users.event.business.updated',
  })
  public async onBusinessUpdate(businessDto: BusinessDto): Promise<void> {
    this.logger.log({
      context: 'BusinessBusMessagesController',
      data: businessDto,
      message: 'received a business updated event',
    });

    await this.businessService.save(businessDto);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: 'users.event.business.export',
  })
  public async onBusinessExport(businessDto: BusinessDto): Promise<void> {
    this.logger.log({
      context: 'BusinessBusMessagesController',
      data: businessDto,
      message: 'received a business export event',
    });

    await this.businessService.save(businessDto);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: 'users.event.business.removed',
  })
  public async onBusinessRemovedEvent(businessDto: RemoveBusinessDto): Promise<void> {
    this.logger.log({
      context: 'BusinessBusMessagesController',
      data: businessDto,
      message: 'received a business remove event',
    });

    await this.businessService.deleteOneById(businessDto._id);
    await this.exampleService.removeBusinessExamples(businessDto._id);
  }
}
