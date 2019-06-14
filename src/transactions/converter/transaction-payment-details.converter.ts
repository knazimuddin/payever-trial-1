import { Injectable, Logger } from '@nestjs/common';
import { TransactionPackedDetailsInterface, TransactionUnpackedDetailsInterface } from '../interfaces/transaction';

@Injectable()
export class TransactionPaymentDetailsConverter {

  public static convert(
    transaction: TransactionPackedDetailsInterface,
  ): TransactionUnpackedDetailsInterface {
    const unpacked: TransactionUnpackedDetailsInterface = {
      id: transaction.id,
      original_id: transaction.original_id,
      uuid: transaction.uuid,
      action_running: transaction.action_running,
      available_refund_items: transaction.available_refund_items,
      amount: transaction.amount,
      amount_refunded: transaction.amount_refunded,
      amount_rest: transaction.amount_rest,
      billing_address: transaction.billing_address,
      business_option_id: transaction.business_option_id,
      business_uuid: transaction.business_uuid,
      channel: transaction.channel,
      channel_uuid: transaction.channel_uuid,
      channel_set_uuid: transaction.channel_set_uuid,
      created_at: transaction.created_at,
      currency: transaction.currency,
      customer_email: transaction.customer_email,
      customer_name: transaction.customer_name,
      delivery_fee: transaction.delivery_fee,
      down_payment: transaction.down_payment,
      fee_accepted: transaction.fee_accepted,
      history: transaction.history,
      items: transaction.items,
      merchant_email: transaction.merchant_email,
      merchant_name: transaction.merchant_name,
      payment_details: {},
      payment_fee: transaction.payment_fee,
      payment_flow_id: transaction.payment_flow_id,
      place: transaction.place,
      reference: transaction.reference,
      santander_applications: transaction.santander_applications,
      shipping_address: transaction.shipping_address,
      shipping_category: transaction.shipping_category,
      shipping_method_name: transaction.shipping_method_name,
      shipping_option_name: transaction.shipping_option_name,
      specific_status: transaction.specific_status,
      status: transaction.status,
      status_color: transaction.status_color,
      store_id: transaction.store_id,
      store_name: transaction.store_name,
      total: transaction.total,
      type: transaction.type,
      updated_at: transaction.updated_at,
      user_uuid: transaction.user_uuid,
    };

    try {
      unpacked.payment_details =
        transaction.payment_details
        ? JSON.parse(transaction.payment_details)
        : {}
      ;
    } catch (e) {
      Logger.log({
        message: 'Error during unpack of payment details',
        transaction: transaction,
        error: e.message,
        context: 'TransactionService',
      });
      // just skipping payment_details
    }

    return unpacked;
  }
}