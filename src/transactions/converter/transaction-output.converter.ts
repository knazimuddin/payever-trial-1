import { Injectable } from '@nestjs/common';
import { ActionItemInterface } from '../interfaces';
import {
  TransactionOutputInterface,
  TransactionUnpackedDetailsInterface,
  UnpackedDetailsInterface,
} from '../interfaces/transaction';

@Injectable()
export class TransactionOutputConverter {

  public static convert(
    transaction: TransactionUnpackedDetailsInterface,
    actions: ActionItemInterface[],
  ): TransactionOutputInterface {
    const details: UnpackedDetailsInterface = Object.assign({ }, transaction.payment_details);
    delete details.finance_id;
    delete details.application_no;
    delete details.application_number;
    delete details.applicationNumber;
    delete details.usage_text;
    delete details.pan_id;
    delete details.usageText;
    delete details.panId;
    delete details.iban;
    delete details.bank_i_b_a_n;

    if (transaction?.payment_details?.applicationNumber) {
      transaction.payment_details.application_number = transaction.payment_details.applicationNumber;
    }

    if (transaction?.payment_details?.usageText) {
      transaction.payment_details.usage_text = transaction.payment_details.usageText;
    }

    if (transaction?.payment_details?.panId) {
      transaction.payment_details.pan_id = transaction.payment_details.panId;
    }

    return {
      actions: actions,
      transaction: {
        id: transaction.id,
        original_id: transaction.original_id,
        uuid: transaction.uuid,

        amount: transaction.amount,
        amount_capture_rest: transaction.amount_capture_rest,
        amount_captured: transaction.amount_captured,
        amount_refund_rest: transaction.amount_refund_rest,
        amount_refunded: transaction.amount_refunded,
        currency: transaction.currency,
        total: transaction.total,

        created_at: transaction.created_at,
        updated_at: transaction.updated_at,

        example: transaction.example,
      },

      billing_address: transaction.billing_address,
      business: {
        uuid: transaction.business_uuid,
      },
      cart: {
        available_refund_items: transaction.available_refund_items,
        items: transaction.items,
      },
      channel: {
        name: transaction.channel,
        uuid: transaction.channel_uuid,
      },
      channel_set: {
        uuid: transaction.channel_set_uuid,
      },
      customer: {
        email: transaction.customer_email,
        name: transaction.customer_name,
      },
      details: {
        ...details,
        order: {
          application_no: transaction.payment_details.application_no || transaction.payment_details.application_number,
          finance_id: transaction.payment_details.finance_id,
          iban: transaction.payment_details.iban || transaction.payment_details.bank_i_b_a_n,
          pan_id: transaction.payment_details.pan_id || transaction.payment_details.usage_text,
          reference: transaction.reference,
        },
      },
      history: transaction.history,
      merchant: {
        email: transaction.merchant_email,
        name: transaction.merchant_name,
      },
      payment_flow: {
        id: transaction.payment_flow_id,
      },
      payment_option: {
        down_payment: transaction.down_payment,
        fee_accepted: transaction.fee_accepted,
        id: transaction.business_option_id,
        payment_fee: transaction.payment_fee,
        type: transaction.type,
      },
      shipping: {
        address: transaction.shipping_address,
        category: transaction.shipping_category,
        delivery_fee: transaction.delivery_fee,
        method_name: transaction.shipping_method_name,
        option_name: transaction.shipping_option_name,

        example_label: transaction.example_shipping_label,
        example_slip: transaction.example_shipping_slip,
        order_id: transaction.shipping_order_id,
      },
      status: {
        color: transaction.status_color,
        general: transaction.status,
        place: transaction.place,
        specific: transaction.specific_status,
      },
      store: {
        id: transaction.store_id,
        name: transaction.store_name,
      },
      user: {
        uuid: transaction.user_uuid,
      },
    };
  }
}
