import { Injectable } from '@nestjs/common';
import { RabbitMqClient } from '@pe/nest-kit';
import { PaymentMailDtoConverter } from '../converter';
import { PaymentMailDto, PaymentSubmittedDto } from '../dto';

@Injectable()
export class PaymentMailEventProducer {
  constructor(
    private readonly rabbitMqClient: RabbitMqClient,
  ) {}

  public async produceOrderInvoiceEvent(paymentSubmittedDto: PaymentSubmittedDto): Promise<void> {

    if (!this.isInvoiceSendNeeded(paymentSubmittedDto)) {
      return ;
    }

    const mailDto: PaymentMailDto = PaymentMailDtoConverter.fromPaymentSubmittedDto(paymentSubmittedDto);

    return this.rabbitMqClient.sendAsync(
      {
        channel: 'payever.event.payment.email',
        exchange: 'async_events',
      },
      {
        name: 'payever.event.payment.email',
        payload: mailDto,
      },
    );
  }

  private isInvoiceSendNeeded(paymentSubmittedDto: PaymentSubmittedDto): boolean {
    return ['shop', 'pos', 'mail'].indexOf(paymentSubmittedDto.payment.channel) !== -1;
  }
}
