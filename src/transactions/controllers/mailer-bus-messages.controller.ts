import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessageBusService } from '@pe/nest-kit';
import { RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { PaymentMailSentDto } from '../dto';
import { TransactionHistoryService, TransactionsService } from '../services';
import { TransactionModel } from '../models';
import { HistoryEventDataInterface } from '../interfaces/history-event-message';

@Controller()
export class MailerBusMessagesController {
  private messageBusService: MessageBusService = new MessageBusService(
    {
      rsa: environment.rsa,
    },
    this.logger,
  );

  constructor(
    private readonly logger: Logger,
    private readonly transactionService: TransactionsService,
    private readonly historyService: TransactionHistoryService,
  ) {}

  @MessagePattern({
    name: RabbitRoutingKeys.MailerPaymentMailSent,
    origin: 'rabbitmq',
  })
  public async onPaymentMailSent(msg: any): Promise<void> {
    const paymentMailSentDto: PaymentMailSentDto = this.messageBusService.unwrapMessage<PaymentMailSentDto>(msg.data);

    const transaction: TransactionModel = await this.transactionService.findModelByUuid(paymentMailSentDto.transactionId);

    if (!transaction) {
      this.logger.error(`Transaction "${paymentMailSentDto.transactionId}" not found`);

      return ;
    }

    await this.historyService.processHistoryRecord(
      transaction,
      'email_sent',
      new Date(),
      {
        mail_event: {
          event_id: paymentMailSentDto.id,
          template_name: paymentMailSentDto.templateName,
        },
      } as HistoryEventDataInterface,
    );
  }
}
