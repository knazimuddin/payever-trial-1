import { Injectable, Logger } from '@nestjs/common';
import { ActionItemInterface } from '../interfaces';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { MessagingService } from './messaging.service';
import { PaymentActionsEnum } from '../enum';

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
      actions = actions.concat(this.getShippingActions(unpackedTransaction));
    } catch (e) {
      this.logger.error(
        {
          context: 'ActionsRetriever',
          error: e.message,
          message: `Error occurred while getting transaction actions`,
        },
      );
      actions = [];
    }

    return actions;
  }

  private getShippingActions(unpackedTransaction: TransactionUnpackedDetailsInterface): ActionItemInterface[] {
    const actions: ActionItemInterface[] = [];
    if (unpackedTransaction.is_shipping_order_processed) {
      actions.push({
        action: PaymentActionsEnum.DownloadShippingSlip as string,
        enabled: true,
      });

       if (unpackedTransaction.shipping_category === 'custom') {
         actions.push({
           action: PaymentActionsEnum.DownloadShippingLabel as string,
           enabled: true,
         });
       }
    }

    return actions;
  }
}
