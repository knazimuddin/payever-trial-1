import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessageBusService } from '@pe/nest-kit';

import { RabbitChannels, RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { TransactionPaymentDetailsConverter } from '../converter/transaction-payment-details.converter';
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
  ) {
  }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.ThirdPartyPaymentActionRequested,
    origin: 'rabbitmq',
  })
  public async onThirdPartyPaymentActionEvent(msg: any): Promise<void> {
    const data: ThirdPartyActionRequestInterface = this.messageBusService
      .unwrapMessage<ThirdPartyActionRequestInterface>(msg.data);

    this.logger.debug({
      message: `THIRD-PARTY.ACTION Transaction action request`,
      data,
      context: 'ThirdPartyEventsController',
    });

    const transaction: TransactionModel = await this.transactionService.findModelByParams({
      reference: data.reference,
      business_uuid: data.business.id,
    });

    if (!transaction) {
      this.logger.warn({
        message: `THIRD-PARTY.ACTION Transaction not found by reference ${data.reference}`,
        context: 'ThirdPartyEventsController',
      });

      return;
    }

    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    const actions: ActionItemInterface[] = await this.messagingService.getActionsList(unpackedTransaction);
    const targetAction: ActionItemInterface = actions.find(item => item.action === data.action);

    if (!targetAction || !targetAction.enabled) {
      this.logger.warn({
        message: `THIRD-PARTY.ACTION Transaction action not allowed for reference ${data.reference}`,
        targetAction,
        context: 'ThirdPartyEventsController',
      });

      return;
    }

    return this.messagingService.runAction(unpackedTransaction, targetAction.action, data);
  }
}
