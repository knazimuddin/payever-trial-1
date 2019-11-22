import { Injectable } from '@nestjs/common';
import { RabbitMqClient } from '@pe/nest-kit';
import { OderInvoiceMailDtoConverter } from '../converter';
import { PaymentMailDto, PaymentSubmittedDto, TransactionPaymentDto } from '../dto';
import { PaymentStatusesEnum } from '../enum';
import { ShippingMailDto } from '../dto/mail';

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

    const mailDto: PaymentMailDto = OderInvoiceMailDtoConverter.fromPaymentSubmittedDto(paymentSubmittedDto);

    return this.sendMailEvent(mailDto);
  }

  public async produceShippingEvent(mailDto: ShippingMailDto): Promise<void> {
    return this.sendMailEvent(mailDto);
  }

  private isInvoiceSupportedChannel(paymentSubmittedDto: PaymentSubmittedDto): boolean {
    return ['shop', 'mail'].indexOf(paymentSubmittedDto.payment.channel) !== -1;
  }

  private isStatusSuccessFull(payment: TransactionPaymentDto): boolean {
    return [
      PaymentStatusesEnum.Declined,
      PaymentStatusesEnum.Cancelled,
      PaymentStatusesEnum.Failed,
      PaymentStatusesEnum.Refunded,
      PaymentStatusesEnum.New,
    ].indexOf(payment.status) === -1;
  }

  private sendMailEvent(mailDto: PaymentMailDto): Promise<void> {
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
}
