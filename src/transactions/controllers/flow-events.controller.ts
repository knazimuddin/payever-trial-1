import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitChannels, RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { PaymentFlowInterface } from '../interfaces';
import { PaymentFlowService } from '../services';

@Controller()
export class FlowEventsController {
  constructor(
    private readonly flowService: PaymentFlowService,
    private readonly logger: Logger,
  ) {}

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowCreated,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowCreatedEvent(data: { flow: PaymentFlowInterface }): Promise<void> {
    return this.createOrUpdate(data, 'FLOW.CREATE');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowMigrate,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowMigrateEvent(data: { flow: PaymentFlowInterface }): Promise<void> {
    return this.createOrUpdate(data, 'FLOW.MIGRATE');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowUpdated,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowUpdatedEvent(msg: any): Promise<void> {
    return this.createOrUpdate(msg, 'FLOW.UPDATE');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowRemoved,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowRemovedEvent(data: { flow: PaymentFlowInterface }): Promise<void> {
    this.logger.log({ text: 'FLOW.REMOVE', data });
    const flow: PaymentFlowInterface = data.flow;
    await this.flowService.removeById(flow.id);
    this.logger.log('FLOW.REMOVE COMPLETED');
  }

  private async createOrUpdate(data: { flow: PaymentFlowInterface }, action: string): Promise<void> {
    this.logger.log({ text: action, data });
    const flow: PaymentFlowInterface = data.flow;
    await this.flowService.createOrUpdate(flow);
    this.logger.log(`${action} COMPLETED`);
  }
}
