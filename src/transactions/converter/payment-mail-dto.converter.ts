import { Injectable } from '@nestjs/common';
import { PaymentItemDto, PaymentMailDto, PaymentSubmittedDto, TransactionCartItemDto } from '../dto';

@Injectable()
export class PaymentMailDtoConverter {
  public static fromPaymentSubmittedDto(paymentSubmittedDto: PaymentSubmittedDto): PaymentMailDto {
    return {
      to: paymentSubmittedDto.payment.customer_email,
      cc: [],
      template_name: 'order_invoice_template',
      business: {
        uuid: paymentSubmittedDto.payment.business_uuid,
      },
      payment: {
        id: paymentSubmittedDto.payment.id,
        amount: paymentSubmittedDto.payment.amount,
        currency: paymentSubmittedDto.payment.currency,
        reference: paymentSubmittedDto.payment.reference,
        total: paymentSubmittedDto.payment.total,
        created_at: paymentSubmittedDto.payment.created_at,
        customer_email: paymentSubmittedDto.payment.customer_email,
        customer_name: paymentSubmittedDto.payment.customer_name,
        address: paymentSubmittedDto.payment.shipping_address,
        vat_rate: PaymentMailDtoConverter.calculateTaxAmount(paymentSubmittedDto),
      },

      payment_items: paymentSubmittedDto.payment.items.map((item: TransactionCartItemDto): PaymentItemDto => ({
        uuid: item.uuid,
        thumbnail: item.thumbnail,
        price: item.price,
        quantity: item.quantity,
        vat_rate: item.vat_rate,
        name: item.name,
      })),
    };
  }

  private static calculateTaxAmount(paymentSubmittedDto: PaymentSubmittedDto): number {
    let taxAmount = 0;
    for (const item of paymentSubmittedDto.payment.items) {
      taxAmount += item.vat_rate;
    }

    return taxAmount;
  }
}
