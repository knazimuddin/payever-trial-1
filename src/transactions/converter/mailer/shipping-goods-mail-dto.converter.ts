import { PaymentItemDto, ShippingMailDto } from '../../dto/mail';
import { ShippingOrderProcessedMessageDto, TransactionCartItemDto } from '../../dto';
import { AbstractPaymentMailDtoConverter } from './abstract-payment-mail-dto.converter';
import { TransactionUnpackedDetailsInterface } from '../../interfaces/transaction';

export class ShippingGoodsMailDtoConverter extends AbstractPaymentMailDtoConverter{
  public static fromTransactionAndShippingOrder(
    transaction: TransactionUnpackedDetailsInterface,
    shippingOrder: ShippingOrderProcessedMessageDto,
  ): ShippingMailDto {
    return {
      cc: [],
      to: transaction.customer_email,

      template_name: 'shipping_order_template',

      business: {
        uuid: transaction.business_uuid,
      },
      payment: {
        id: transaction.original_id,
        uuid: transaction.uuid,
        address: transaction.shipping_address,

        amount: transaction.amount,
        created_at: transaction.created_at,
        currency: transaction.currency,
        reference: transaction.reference,
        total: transaction.total,

        customer_email: transaction.customer_email,
        customer_name: transaction.customer_name,
        payment_option: {
          payment_method: transaction.type,
        },
        vat_rate: ShippingGoodsMailDtoConverter.calculateTaxAmount(transaction.items),
      },

      payment_items: transaction.items.map((item: TransactionCartItemDto): PaymentItemDto => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.thumbnail,
        uuid: item.uuid,
        vat_rate: item.vat_rate,
      })),
      variables: {
        trackingNumber: shippingOrder.trackingNumber,
        trackingUrl: shippingOrder.trackingUrl,
        deliveryDate: shippingOrder.deliveryDate,
      }
    };
  }
}
