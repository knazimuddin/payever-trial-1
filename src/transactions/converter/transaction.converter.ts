import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { TransactionDto } from '../dto';
import { CheckoutTransactionHistoryItemInterface, CheckoutTransactionInterface } from '../interfaces/checkout';
import {
  TransactionHistoryEntryInterface,
  TransactionPackedDetailsInterface,
  TransactionUnpackedDetailsInterface,
} from '../interfaces/transaction';
import { AtomDateConverter } from './atom.date.converter';
import { CheckoutTransactionHistoryEntryConverter } from './checkout-transaction-history-entry.converter';
import { TransactionCartConverter } from './transaction-cart.converter';
import { TransactionSantanderApplicationConverter } from './transaction-santander-application.converter';

@Injectable()
export class TransactionConverter {

  public static fromCheckoutTransaction(
    checkoutTransaction: CheckoutTransactionInterface,
  ): TransactionPackedDetailsInterface {
    const transaction: TransactionPackedDetailsInterface =
      plainToClass<TransactionPackedDetailsInterface, CheckoutTransactionInterface>(
        TransactionDto,
        checkoutTransaction,
      );

    if (checkoutTransaction.address) {
      transaction.billing_address = checkoutTransaction.address;
    }

    transaction.type = checkoutTransaction.type || checkoutTransaction.payment_type;

    if (checkoutTransaction.payment_details) {
      TransactionSantanderApplicationConverter.setSantanderApplication(transaction, checkoutTransaction);
      transaction.payment_details = JSON.stringify(checkoutTransaction.payment_details);
    }

    if (checkoutTransaction.business) {
      transaction.businessId = checkoutTransaction.business.uuid;
      transaction.merchant_name = checkoutTransaction.business.company_name;
      transaction.merchant_email = checkoutTransaction.business.company_email;
    }

    if (checkoutTransaction.payment_flow) {
      transaction.payment_flow_id = checkoutTransaction.payment_flow.id;
    }

    if (checkoutTransaction.channel_set) {
      transaction.channel_set_uuid = checkoutTransaction.channel_set.uuid;
    }

    if (checkoutTransaction.items.length) {
      transaction.items = TransactionCartConverter.fromCheckoutTransactionCart(
        checkoutTransaction.items,
        transaction.businessId,
      );
    }

    transaction.created_at = AtomDateConverter.fromAtomFormatToDate(checkoutTransaction.created_at);
    transaction.updated_at = AtomDateConverter.fromAtomFormatToDate(checkoutTransaction.updated_at);

    /**
     * We do not update history with current operation.
     * History comes with another events and processing separately.
     */
    delete transaction.history;

    return transaction;
  }

  public static toCheckoutTransaction(
    transaction: TransactionUnpackedDetailsInterface,
  ): CheckoutTransactionInterface {
    const history: CheckoutTransactionHistoryItemInterface[] = transaction.history.map(
      (item: TransactionHistoryEntryInterface) =>
        CheckoutTransactionHistoryEntryConverter.fromTransactionHistoryItem(item),
    );

    return {
      id: transaction.original_id,
      uuid: transaction.uuid,

      address: transaction.billing_address,
      created_at: AtomDateConverter.fromDateToAtomFormat(transaction.created_at),
      updated_at: AtomDateConverter.fromDateToAtomFormat(transaction.updated_at),

      action_running: transaction.action_running,
      amount: transaction.amount,
      business_option_id: transaction.business_option_id,
      business_uuid: transaction.businessId,
      channel: transaction.channel,
      channel_set_uuid: transaction.channel_set_uuid,
      channel_uuid: transaction.channel_uuid,
      currency: transaction.currency,
      customer_email: transaction.customer_email,
      customer_name: transaction.customer_name,
      delivery_fee: transaction.delivery_fee,
      down_payment: transaction.down_payment,
      fee_accepted: transaction.fee_accepted,
      history: history,
      items: transaction.items,
      merchant_email: transaction.merchant_email,
      merchant_name: transaction.merchant_name,
      payment_details: transaction.payment_details,
      payment_fee: transaction.payment_fee,
      payment_flow_id: transaction.payment_flow_id,
      place: transaction.place,
      reference: transaction.reference || transaction.uuid,
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
      user_uuid: transaction.user_uuid,
    };
  }
}
