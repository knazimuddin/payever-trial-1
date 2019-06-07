import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { RabbitChannels, RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { PaymentFlowService } from '../services';

@Controller()
export class FlowEventsController {
  private messageBusService: MessageBusService = new MessageBusService(
    {
      rsa: environment.rsa,
    },
    this.logger,
  );

  constructor(
    private readonly flowService: PaymentFlowService,
    private readonly logger: Logger,
  ) { }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowCreated,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowCreatedEvent(msg: any): Promise<void> {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    this.logger.log({ text: 'FLOW.CREATE', data });
    const flow: any = data.flow;
    await this.flowService.createOrUpdate(flow);
    this.logger.log('FLOW.CREATE COMPLETED');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowMigrate,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowMigrateEvent(msg: any): Promise<void> {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    this.logger.log({ text: 'FLOW.MIGRATE', data });
    const flow: any = data.flow;
    await this.flowService.createOrUpdate(flow);
    this.logger.log('FLOW.MIGRATE COMPLETED');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowUpdated,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowUpdatedEvent(msg: any): Promise<void> {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    this.logger.log({ text: 'FLOW.UPDATE', data });
    const flow: any = data.flow;
    await this.flowService.createOrUpdate(flow);
    this.logger.log('FLOW.UPDATE COMPLETED');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowRemoved,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowRemovedEvent(msg: any): Promise<void> {
    const data: any = this.messageBusService.unwrapMessage<any>(msg.data);
    this.logger.log({ text: 'FLOW.REMOVE', data });
    const flow: any = data.flow;
    await this.flowService.removeById(flow.id);
    this.logger.log('FLOW.REMOVE COMPLETED');
  }
}
