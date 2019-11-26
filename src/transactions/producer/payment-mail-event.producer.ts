import { Injectable } from '@nestjs/common';
import { RabbitMqClient } from '@pe/nest-kit';
import { OderInvoiceMailDtoConverter } from '../converter';
import { PaymentMailDto } from '../dto';
import { PaymentStatusesEnum } from '../enum';
import { ShippingMailDto } from '../dto/mail';
import { TransactionChangedDto, TransactionDto } from '../dto/checkout-rabbit';

@Injectable()
export class PaymentMailEventProducer {
  constructor(
    private readonly rabbitMqClient: RabbitMqClient,
  ) {}

  public async produceOrderInvoiceEvent(paymentSubmittedDto: TransactionChangedDto): Promise<void> {

    if (
      !this.isInvoiceSupportedChannel(paymentSubmittedDto) ||
      !this.isStatusSuccessFull(paymentSubmittedDto.payment)
    ) {
      return ;
    }

    const mailDto: PaymentMailDto = OderInvoiceMailDtoConverter.fromTransactionChangedDto(paymentSubmittedDto);

    return this.sendMailEvent(mailDto);
  }

  public async produceShippingEvent(mailDto: ShippingMailDto): Promise<void> {
    return this.sendMailEvent(mailDto);
  }

  private isInvoiceSupportedChannel(paymentSubmittedDto: TransactionChangedDto): boolean {
    return ['shop', 'mail'].includes(paymentSubmittedDto.payment.channel);
  }

  private isStatusSuccessFull(payment: TransactionDto): boolean {
    return [
      PaymentStatusesEnum.Declined,
      PaymentStatusesEnum.Cancelled,
      PaymentStatusesEnum.Failed,
      PaymentStatusesEnum.Refunded,
      PaymentStatusesEnum.New,
    ].indexOf(payment.status as PaymentStatusesEnum) === -1;
  }

  private async sendMailEvent(mailDto: PaymentMailDto): Promise<void> {
    await this.rabbitMqClient.send(
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
