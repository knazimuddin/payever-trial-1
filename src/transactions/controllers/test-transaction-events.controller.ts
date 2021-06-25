import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitRoutingKeys, RabbitChannels } from '../../enums';
import { TransactionChangedDto, TransactionRemovedDto } from '../dto/checkout-rabbit';
import { TransactionsService } from '../services';
import { TransactionEventsController } from './transaction-events.controller';
import { ActionCompletedMessageDto, AddHistoryEventMessageDto } from '../dto/payment-micro';

@Controller()
export class TestTransactionEventsController extends TransactionEventsController {
  public async onModuleInit(): Promise<void> {
    this.transactionsService = await this.moduleRef.create(TransactionsService);
    this.transactionsService.switchTestMode();
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentCreatedTestMode,
  })
  public async onTransactionCreateEvent(data: TransactionChangedDto): Promise<void> {
    return super.onTransactionCreateEvent(data);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentUpdatedTestMode,
  })
  public async onTransactionUpdateEvent(data: TransactionChangedDto): Promise<void> {
    return super.onTransactionUpdateEvent(data);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentRemovedTestMode,
  })
  public async onTransactionRemoveEvent(data: TransactionRemovedDto): Promise<void> {
    return super.onTransactionRemoveEvent(data);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentSubmittedTestMode,
  })
  public async onTransactionSubmittedEvent(data: TransactionChangedDto): Promise<void> {
    return super.onTransactionSubmittedEvent(data);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentMigrateTestMode,
  })
  public async onTransactionMigrateEvent(data: TransactionChangedDto): Promise<void> {
    return super.onTransactionMigrateEvent(data);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentActionCompletedTestMode,
  })
  public async onActionCompletedEvent(
    message: ActionCompletedMessageDto,
  ): Promise<void> {
    return super.onActionCompletedEvent(message);
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.PaymentHistoryAddTestMode,
  })
  public async onHistoryAddEvent(
    message: AddHistoryEventMessageDto,
  ): Promise<void> {
    return super.onHistoryAddEvent(message);
  }
}
