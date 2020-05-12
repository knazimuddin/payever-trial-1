import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitRoutingKeys } from '../../enums';
import { PaymentFlowChangedDto, PaymentFlowDto, PaymentFlowRemovedDto } from '../dto/checkout-rabbit';
import { PaymentFlowService } from '../services';

@Controller()
export class FlowEventsController {
  constructor(
    private readonly flowService: PaymentFlowService,
    private readonly logger: Logger,
  ) { }

  @MessagePattern({
    name: RabbitRoutingKeys.PaymentFlowCreated,
  })
  public async onPaymentFlowCreatedEvent(data: PaymentFlowChangedDto): Promise<void> {
    return this.createOrUpdate(data, 'FLOW.CREATE');
  }

  @MessagePattern({
    name: RabbitRoutingKeys.PaymentFlowMigrate,
  })
  public async onPaymentFlowMigrateEvent(data: PaymentFlowChangedDto): Promise<void> {
    return this.createOrUpdate(data, 'FLOW.MIGRATE');
  }

  @MessagePattern({
    name: RabbitRoutingKeys.PaymentFlowUpdated,
  })
  public async onPaymentFlowUpdatedEvent(msg: PaymentFlowChangedDto): Promise<void> {
    return this.createOrUpdate(msg, 'FLOW.UPDATE');
  }

  @MessagePattern({
    name: RabbitRoutingKeys.PaymentFlowRemoved,
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
