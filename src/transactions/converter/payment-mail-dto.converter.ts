import { Injectable } from '@nestjs/common';
import { PaymentItemDto, PaymentMailDto, PaymentSubmittedDto, TransactionCartItemDto } from '../dto';

@Injectable()
export class PaymentMailDtoConverter {
  public static fromPaymentSubmittedDto(paymentSubmittedDto: PaymentSubmittedDto): PaymentMailDto {
    return {
      cc: [],
      to: paymentSubmittedDto.payment.customer_email,

      template_name: 'order_invoice_template',

      business: {
        uuid: paymentSubmittedDto.payment.business.uuid,
      },
      payment: {
        id: paymentSubmittedDto.payment.id,

        address: paymentSubmittedDto.payment.address,

        amount: paymentSubmittedDto.payment.amount,
        created_at: paymentSubmittedDto.payment.created_at,
        currency: paymentSubmittedDto.payment.currency,
        reference: paymentSubmittedDto.payment.reference,
        total: paymentSubmittedDto.payment.total,
        vat_rate: PaymentMailDtoConverter.calculateTaxAmount(paymentSubmittedDto),

        customer_email: paymentSubmittedDto.payment.customer_email,
        customer_name: paymentSubmittedDto.payment.customer_name,
        payment_option: {
          payment_method: paymentSubmittedDto.payment.payment_type,
        },
      },

      payment_items: paymentSubmittedDto.payment.items.map((item: TransactionCartItemDto): PaymentItemDto => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.thumbnail,
        uuid: item.uuid,
        vat_rate: item.vat_rate,
      })),
    };
  }

  private static calculateTaxAmount(paymentSubmittedDto: PaymentSubmittedDto): number {
    let taxAmount: number = 0;
    for (const item of paymentSubmittedDto.payment.items) {
      taxAmount += item.vat_rate;
    }

    return taxAmount;
  }
}
