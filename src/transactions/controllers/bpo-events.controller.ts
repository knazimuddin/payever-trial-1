import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitChannels, RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { BusinessPaymentOptionInterface } from '../interfaces';
import { BusinessPaymentOptionService } from '../services';
import { BusinessPaymentOptionChangedDto } from '../dto/checkout-rabbit';

@Controller()
export class BpoEventsController {
  constructor(
    private readonly bpoService: BusinessPaymentOptionService,
    private readonly logger: Logger,
  ) {}

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.BpoCreated,
    origin: 'rabbitmq',
  })
  public async onBpoCreatedEvent(data: BusinessPaymentOptionChangedDto): Promise<void> {
    return this.createOrUpdate('CREATE', data);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.BpoUpdated,
    origin: 'rabbitmq',
  })
  public async onBpoUpdatedEvent(data: BusinessPaymentOptionChangedDto): Promise<void> {
    return this.createOrUpdate('UPDATE', data);
  }

  public async createOrUpdate(
    createOrUpdate: string,
    data: BusinessPaymentOptionChangedDto,
  ): Promise<void> {
    this.logger.log({ text: `BPO.${createOrUpdate}`, data });
    await this.bpoService.createOrUpdate(data.business_payment_option);
    this.logger.log(`BPO.${createOrUpdate} COMPLETED`);
  }
}
