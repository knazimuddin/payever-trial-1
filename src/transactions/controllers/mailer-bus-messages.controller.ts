import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitRoutingKeys } from '../../enums';
import { PaymentMailSentDto } from '../dto';
import { HistoryEventDataInterface } from '../interfaces/history-event-message';
import { TransactionModel } from '../models';
import { TransactionHistoryService, TransactionsService } from '../services';

@Controller()
export class MailerBusMessagesController {
  constructor(
    private readonly logger: Logger,
    private readonly transactionService: TransactionsService,
    private readonly historyService: TransactionHistoryService,
  ) { }

  @MessagePattern({
    name: RabbitRoutingKeys.MailerPaymentMailSent,
  })
  public async onPaymentMailSent(paymentMailSentDto: PaymentMailSentDto): Promise<void> {
    const transaction: TransactionModel = await this.transactionService.findModelByUuid(
      paymentMailSentDto.transactionId,
    );

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
