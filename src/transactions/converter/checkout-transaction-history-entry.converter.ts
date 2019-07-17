import { CheckoutTransactionHistoryItemInterface } from '../interfaces/checkout';
import { TransactionHistoryEntryInterface } from '../interfaces/transaction';
import { AtomDateConverter } from './atom.date.converter';

export class CheckoutTransactionHistoryEntryConverter {

  public static fromTransactionHistoryItem(
    data: TransactionHistoryEntryInterface,
  ): CheckoutTransactionHistoryItemInterface {
    const item: CheckoutTransactionHistoryItemInterface = {
      action: data.action,
      amount: data.amount,
      created_at: AtomDateConverter.fromDateToAtomFormat(data.created_at),
      payment_status: data.payment_status,
    };

    if (data.params) {
      item.params = data.params;
    }

    if (data.reason) {
      item.reason = data.reason;
    }

    if (data.is_restock_items) {
      item.is_restock_items = data.is_restock_items;
    }

    if (data.upload_items) {
      item.upload_items = data.upload_items;
    }

    if (data.refund_items) {
      item.refund_items = data.refund_items;
    }

    return item;
  }
}
