import { Injectable, Logger } from '@nestjs/common';
import { ActionItemInterface } from '../interfaces';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { MessagingService } from './messaging.service';

@Injectable()
export class ActionsRetriever {

  constructor(
    private readonly messagingService: MessagingService,
    private readonly logger: Logger,
  ) {}

  public async retrieve(unpackedTransaction: TransactionUnpackedDetailsInterface): Promise<ActionItemInterface[]> {
    let actions: ActionItemInterface[] = [];

    try {
      actions = await this.messagingService.getActionsList(unpackedTransaction);
    } catch (e) {
      this.logger.error(
        {
          error: e.message,
          message: `Error occurred while getting transaction actions`,
        },
        e.stack,
        ActionsRetriever.name,
      );
      actions = [];
    }

    return actions;
  }

  public retrieveFakeActions(unpackedTransaction: TransactionUnpackedDetailsInterface): ActionItemInterface[] {
    switch (unpackedTransaction.status) {
      case 'STATUS_ACCEPTED':
        return [
          {
            action: 'refund',
            enabled: true,
          },
          {
            action: 'cancel',
            enabled: true,
          },
          {
            action: 'shipping_goods',
            enabled: true,
          },
        ];
      case 'STATUS_PAID':
      case 'STATUS_REFUNDED':
      case 'STATUS_CANCELLED':
        return [];
      default:
        return [];
    }
  }
}
