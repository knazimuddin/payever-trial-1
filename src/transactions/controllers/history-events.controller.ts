import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { EventDispatcher } from '@pe/nest-kit';
import { RabbitRoutingKeys } from '../../enums';
import { ActionCompletedMessageDto, AddHistoryEventMessageDto } from '../dto/payment-micro';
import { PaymentActionEventEnum } from '../enum/events';
import { TransactionModel } from '../models';
import { TransactionHistoryService, TransactionsService } from '../services';

@Controller()
export class HistoryEventsController {
  constructor(
    private readonly transactionService: TransactionsService,
    private readonly historyService: TransactionHistoryService,
    private readonly logger: Logger,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  @MessagePattern({
    name: RabbitRoutingKeys.PaymentActionCompleted,
  })
  public async onActionCompletedEvent(
    message: ActionCompletedMessageDto,
  ): Promise<void> {
    this.logger.log({ text: 'ACTION.COMPLETED', message });
    const search: { [key: string]: string } = message.payment.uuid
      ? { uuid: message.payment.uuid }
      : { original_id: message.payment.id }
    ;

    this.logger.log({ text: 'ACTION.COMPLETED Search Params', searchParams: search });
    const transaction: TransactionModel = await this.transactionService.findModelByParams(search);
    if (!transaction) {
      this.logger.warn({ text: 'ACTION.COMPLETED: Transaction is not found', data: message.payment });

      return;
    }

    this.logger.log({ text: 'ACTION.COMPLETED: Transaction found', transaction });

    await this.eventDispatcher.dispatch(
      PaymentActionEventEnum.PaymentActionCompleted,
      transaction,
      message,
    );
    this.logger.log({ text: 'ACTION.COMPLETED: Saved', transaction });
  }

  @MessagePattern({
    name: RabbitRoutingKeys.PaymentHistoryAdd,
  })
  public async onHistoryAddEvent(
    message: AddHistoryEventMessageDto,
  ): Promise<void> {
    this.logger.log({ text: 'HISTORY.ADD', message });
    // @TODO use only uuid later, no original_id
    const search: { [key: string]: string } = message.payment.uuid
      ? { uuid: message.payment.uuid }
      : { original_id: message.payment.id }
    ;

    this.logger.log({ text: 'HISTORY.ADD Search Params', searchParams: search });
    const transaction: TransactionModel = await this.transactionService.findModelByParams(search);
    if (!transaction) {
      this.logger.warn({ text: 'HISTORY.ADD: Transaction is not found', data: message.payment });

      return;
    }

    this.logger.log({ text: 'HISTORY.ADD: Transaction found', transaction });
    await this.historyService.processHistoryRecord(
      transaction,
      message.history_type,
      new Date(),
      message.data,
    );
    this.logger.log({ text: 'HISTORY.ADD: Saved', transaction });
  }
}
