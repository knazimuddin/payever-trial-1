import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitChannels, RabbitRoutingKeys } from '../../enums';
import { PaymentFlowInterface } from '../interfaces';
import { PaymentFlowService } from '../services';
import { PaymentFlowChangedDto, PaymentFlowDto, PaymentFlowRemovedDto } from '../dto/checkout-rabbit';

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
  public async onPaymentFlowCreatedEvent(data: PaymentFlowChangedDto): Promise<void> {
    return this.createOrUpdate(data, 'FLOW.CREATE');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowMigrate,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowMigrateEvent(data: PaymentFlowChangedDto): Promise<void> {
    return this.createOrUpdate(data, 'FLOW.MIGRATE');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowUpdated,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowUpdatedEvent(msg: PaymentFlowChangedDto): Promise<void> {
    return this.createOrUpdate(msg, 'FLOW.UPDATE');
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentFlowRemoved,
    origin: 'rabbitmq',
  })
  public async onPaymentFlowRemovedEvent(data: PaymentFlowRemovedDto): Promise<void> {
    this.logger.log({ text: 'FLOW.REMOVE', data });
    await this.flowService.removeById(data.flow.id);
    this.logger.log('FLOW.REMOVE COMPLETED');
  }

  private async createOrUpdate(data: PaymentFlowChangedDto, action: string): Promise<void> {
    this.logger.log({ text: action, data });
    const flow: PaymentFlowDto = data.flow;
    await this.flowService.createOrUpdate(flow);
    this.logger.log(`${action} COMPLETED`);
  }
}
