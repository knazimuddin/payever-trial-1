import { Injectable } from '@nestjs/common';
import { ActionItemInterface } from '../interfaces';
import { TransactionOutputInterface, TransactionUnpackedDetailsInterface } from '../interfaces/transaction';

@Injectable()
export class TransactionOutputConverter {

  public static convert(
    transaction: TransactionUnpackedDetailsInterface,
    actions: ActionItemInterface[],
  ): TransactionOutputInterface {
    const details = transaction.payment_details;
    delete details.finance_id;
    delete details.application_no;
    delete details.application_number;
    delete details.usage_text;
    delete details.pan_id;

    return {
      actions: actions,
      transaction: {
        id: transaction.id,
        original_id: transaction.original_id,
        uuid: transaction.uuid,
        currency: transaction.currency,
        amount: transaction.amount,
        amount_refunded: transaction.amount_refunded,
        amount_rest: transaction.amount_rest,
        total: transaction.total,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
      },
      billing_address: transaction.billing_address,
      details: {
        ...transaction.payment_details,
        order: {
          finance_id: transaction.payment_details.finance_id,
          application_no: transaction.payment_details.application_no || transaction.payment_details.application_number,
          usage_text: transaction.payment_details.usage_text,
          pan_id: transaction.payment_details.pan_id,
          reference: transaction.reference,
        },
      },
      payment_option: {
        id: transaction.business_option_id,
        type: transaction.type,
        down_payment: transaction.down_payment,
        payment_fee: transaction.payment_fee,
        fee_accepted: transaction.fee_accepted,
      },
      status: {
        general: transaction.status,
        specific: transaction.specific_status,
        place: transaction.place,
        color: transaction.status_color,
      },
      channel_set: {
        uuid: transaction.channel_set_uuid,
      },
      user: {
        uuid: transaction.user_uuid,
      },
      business: {
        uuid: transaction.business_uuid,
      },
      payment_flow: {
        id: transaction.payment_flow_id,
      },
      channel: {
        name: transaction.channel,
        uuid: transaction.channel_uuid,
      },
      customer: {
        email: transaction.customer_email,
        name: transaction.customer_name,
      },
      history: transaction.history,
      cart: {
        items: transaction.items,
        available_refund_items: transaction.available_refund_items,
      },
      merchant: {
        email: transaction.merchant_email,
        name: transaction.merchant_name,
      },
      shipping: {
        address: transaction.shipping_address,
        category: transaction.shipping_category,
        method_name: transaction.shipping_method_name,
        option_name: transaction.shipping_option_name,
        delivery_fee: transaction.delivery_fee,
      },
      store: {
        id: transaction.store_id,
        name: transaction.store_name,
      },
    };
  }
}
