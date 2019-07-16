import { Injectable } from '@nestjs/common';
import { CheckoutTransactionHistoryItemInterface } from '../interfaces/checkout';
import { TransactionHistoryEntryInterface } from '../interfaces/transaction';
import { DateConverter } from './date.converter';

@Injectable()
export class CheckoutTransactionHistoryEntryConverter {

  public static fromTransactionHistoryItem(
    data: TransactionHistoryEntryInterface,
  ): CheckoutTransactionHistoryItemInterface {
    const item: CheckoutTransactionHistoryItemInterface = {
      action: data.action,
      amount: data.amount,
      payment_status: data.payment_status,
      created_at: DateConverter.fromDateToAtomFormat(data.created_at),
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
