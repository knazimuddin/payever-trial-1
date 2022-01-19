import { Injectable, Logger } from '@nestjs/common';
import { ThirdPartyPaymentsEnum } from '../enum';
import { ActionCallerInterface, ActionItemInterface } from '../interfaces';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { MessagingService } from './messaging.service';
import { ThirdPartyCallerService } from './third-party-caller.service';

@Injectable()
export class ActionsRetriever {

  constructor(
    private readonly messagingService: MessagingService,
    private readonly thirdPartyCallerService: ThirdPartyCallerService,
    private readonly logger: Logger,
  ) { }

  public async retrieve(unpackedTransaction: TransactionUnpackedDetailsInterface): Promise<ActionItemInterface[]> {
    let actions: ActionItemInterface[];

    try {
      const actionCallerService: ActionCallerInterface = this.chooseActionCallerService(unpackedTransaction);

      actions = await actionCallerService.getActionsList(unpackedTransaction);
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
            partialAllowed: false,
          },
          {
            action: 'cancel',
            enabled: true,
            partialAllowed: false,
          },
          {
            action: 'shipping_goods',
            enabled: true,
            partialAllowed: false,
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

  private chooseActionCallerService(
    unpackedTransaction: TransactionUnpackedDetailsInterface,
  ): ActionCallerInterface {
    const thirdPartyMethods: string[] = Object.values(ThirdPartyPaymentsEnum);

    return thirdPartyMethods.includes(unpackedTransaction.type)
      ? this.thirdPartyCallerService
      : this.messagingService;
  }
}
