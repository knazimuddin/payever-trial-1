import { Injectable } from '@nestjs/common';
import { EventListener } from '@pe/nest-kit';
import { PaymentActionEventEnum } from '../enum/events';
import { TransactionModel } from '../models';
import { MessagingService, TransactionsService } from '../services';
import { ActionPayloadDto } from '../dto/action-payload';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';

@Injectable()
export class SendTransactionUpdateEventAfterActionListener {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly messagingService: MessagingService,
  ) { }

  @EventListener(PaymentActionEventEnum.PaymentActionAfter)
  public async sendTransactionUpdateEventAfterAction(
    transaction: TransactionModel,
    actionPayload: ActionPayloadDto,
    action: string,
  ): Promise<void> {
    const updatedTransaction: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByUuid(transaction.uuid);

    /** Send update to checkout-php */
    await this.messagingService.sendTransactionUpdate(updatedTransaction);
  }
}
