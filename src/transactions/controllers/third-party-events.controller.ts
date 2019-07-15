import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessageBusService } from '@pe/nest-kit';
import { RabbitChannels, RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { TransactionPaymentDetailsConverter } from '../converter';
import { ActionItemInterface } from '../interfaces';
import { ThirdPartyActionRequestInterface } from '../interfaces/third-party';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { MessagingService, TransactionsService } from '../services';

@Controller()
export class ThirdPartyEventsController {
  private messageBusService: MessageBusService = new MessageBusService(
    {
      rsa: environment.rsa,
    },
    this.logger,
  );

  constructor(
    private readonly transactionService: TransactionsService,
    private readonly messagingService: MessagingService,
    private readonly logger: Logger,
  ) {}

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.ThirdPartyPaymentActionRequested,
    origin: 'rabbitmq',
  })
  public async onThirdPartyPaymentActionEvent(msg: any): Promise<void> {
    const data: ThirdPartyActionRequestInterface = this.messageBusService
      .unwrapMessage<ThirdPartyActionRequestInterface>(msg.data);

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

    const actions: ActionItemInterface[] = await this.messagingService.getActionsList(unpackedTransaction);
    const targetAction: ActionItemInterface = actions.find(
      (item: ActionItemInterface) => item.action === data.action
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

    return this.messagingService.runAction(unpackedTransaction, targetAction.action, data);
  }
}
