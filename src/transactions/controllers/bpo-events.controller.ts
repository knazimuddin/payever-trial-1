import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessageBusService } from '@pe/nest-kit/modules/message';
import { RabbitChannels, RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { BusinessPaymentOptionInterface } from '../interfaces';
import { BusinessPaymentOptionService } from '../services';

@Controller()
export class BpoEventsController {
  private messageBusService: MessageBusService = new MessageBusService(
    {
      rsa: environment.rsa,
    },
    this.logger,
  );

  constructor(
    private readonly bpoService: BusinessPaymentOptionService,
    private readonly logger: Logger,
  ) {}

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.BpoCreated,
    origin: 'rabbitmq',
  })
  public async onBpoCreatedEvent(msg: any): Promise<void> {
    const data: { business_payment_option: BusinessPaymentOptionInterface } =
      this.messageBusService.unwrapMessage<{ business_payment_option: BusinessPaymentOptionInterface }>(msg.data);
    this.logger.log({ text: 'BPO.CREATE', data });
    await this.bpoService.createOrUpdate(data.business_payment_option);
    this.logger.log('BPO.CREATE COMPLETED');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.BpoUpdated,
    origin: 'rabbitmq',
  })
  public async onBpoUpdatedEvent(msg: any): Promise<void> {
    const data: { business_payment_option: BusinessPaymentOptionInterface } =
      this.messageBusService.unwrapMessage<{ business_payment_option: BusinessPaymentOptionInterface }>(msg.data);
    this.logger.log({ text: 'BPO.UPDATE', data });
    await this.bpoService.createOrUpdate(data.business_payment_option);
    this.logger.log('BPO.UPDATE COMPLETED');
  }
}
