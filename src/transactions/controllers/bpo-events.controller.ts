import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitRoutingKeys, RabbitChannels } from '../../enums';
import { BusinessPaymentOptionChangedDto } from '../dto/checkout-rabbit';
import { BusinessPaymentOptionService } from '../services';

@Controller()
export class BpoEventsController {
  constructor(
    private readonly bpoService: BusinessPaymentOptionService,
    private readonly logger: Logger,
  ) { }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.BpoCreated,
  })
  public async onBpoCreatedEvent(data: BusinessPaymentOptionChangedDto): Promise<void> {
    return this.createOrUpdate('CREATE', data);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.BpoUpdated,
  })
  public async onBpoUpdatedEvent(data: BusinessPaymentOptionChangedDto): Promise<void> {
    return this.createOrUpdate('UPDATE', data);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.BpoMigrate,
  })
  public async onBpoMigrateEvent(data: BusinessPaymentOptionChangedDto): Promise<void> {
    return this.createOrUpdate('MIGRATE', data);
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
