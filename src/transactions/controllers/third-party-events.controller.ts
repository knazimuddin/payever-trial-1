import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitRoutingKeys } from '../../enums';
import { TransactionPaymentDetailsConverter } from '../converter';
import { ActionPayloadDto } from '../dto/action-payload';
import { ActionItemInterface } from '../interfaces';
import { ThirdPartyActionRequestInterface } from '../interfaces/third-party';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { ActionsRetriever, TransactionActionService, TransactionsService } from '../services';

@Controller()
export class ThirdPartyEventsController {
  constructor(
    private readonly transactionActionService: TransactionActionService,
    private readonly actionsRetriever: ActionsRetriever,
    private readonly transactionService: TransactionsService,
    private readonly logger: Logger,
  ) { }

  @MessagePattern({
    name: RabbitRoutingKeys.ThirdPartyPaymentActionRequested,
  })
  public async onThirdPartyPaymentActionEvent(
    data: ThirdPartyActionRequestInterface,
  ): Promise<TransactionUnpackedDetailsInterface> {
    const transaction: TransactionModel = await this.transactionService.findModelByParams({
      business_uuid: data.business.id,
      reference: data.reference,
    });

    if (!transaction) {
      this.logger.warn({
        context: 'ThirdPartyEventsController',
        data: data,
        message: `THIRD-PARTY.ACTION Transaction not found by reference ${data.reference}`,
      });

      return;
    }

    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    const actions: ActionItemInterface[] = await this.actionsRetriever.retrieve(unpackedTransaction);
    const targetAction: ActionItemInterface = actions.find(
      (item: ActionItemInterface) => item.action === data.action,
    );

    if (!targetAction || !targetAction.enabled) {
      this.logger.warn({
        actions: actions,
        context: 'ThirdPartyEventsController',
        message: `THIRD-PARTY.ACTION Transaction action not allowed for reference ${data.reference}`,
        targetAction: targetAction,
        transaction: transaction,
      });

      return;
    }

    return this.transactionActionService.doAction(transaction, data as ActionPayloadDto, targetAction.action);
  }
}
