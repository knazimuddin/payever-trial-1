import { Injectable } from '@nestjs/common';
import { RabbitMqClient } from '@pe/nest-kit';
import { PaymentMailDtoConverter } from '../converter';
import { PaymentMailDto, PaymentSubmittedDto, TransactionPaymentDto } from '../dto';
import { PaymentStatusesEnum } from '../enum';

@Injectable()
export class PaymentMailEventProducer {
  constructor(
    private readonly rabbitMqClient: RabbitMqClient,
  ) {}

  public async produceOrderInvoiceEvent(paymentSubmittedDto: PaymentSubmittedDto): Promise<void> {

    if (
      !this.isInvoiceSupportedChannel(paymentSubmittedDto) ||
      !this.isStatusSuccessFull(paymentSubmittedDto.payment)
    ) {
      return ;
    }

    const mailDto: PaymentMailDto = PaymentMailDtoConverter.fromPaymentSubmittedDto(paymentSubmittedDto);

    return this.rabbitMqClient.send(
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

  private isInvoiceSupportedChannel(paymentSubmittedDto: PaymentSubmittedDto): boolean {
    return ['shop', 'pos', 'mail'].indexOf(paymentSubmittedDto.payment.channel) !== -1;
  }

  private isStatusSuccessFull(payment: TransactionPaymentDto): boolean {
    return [
      PaymentStatusesEnum.Declined,
      PaymentStatusesEnum.Cancelled,
      PaymentStatusesEnum.Failed,
      PaymentStatusesEnum.Refunded,
    ].indexOf(payment.status) === -1;
  }
}
