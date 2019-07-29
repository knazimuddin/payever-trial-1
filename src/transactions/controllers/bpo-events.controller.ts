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
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    const business_payment_option: BusinessPaymentOptionInterface = data.business_payment_option;
    this.logger.log({ text: 'BPO.CREATE', data });
    const bpo: any = {
      _id: data.business_payment_option.uuid,
      ...business_payment_option,
    };
    await this.bpoService.createOrUpdate(bpo);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.BpoUpdated,
    origin: 'rabbitmq',
  })
  public async onBpoUpdatedEvent(msg: any): Promise<void> {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    this.logger.log({ text: 'BPO.UPDATE', data });
    const bpo: any = data.business_payment_option;
    await this.bpoService.createOrUpdate(bpo);
    this.logger.log('BPO.UPDATE COMPLETED');
  }
}
