import { Injectable } from '@nestjs/common';
import { CheckoutTransactionHistoryItemInterface } from '../interfaces/checkout';
import { HistoryEventDataInterface, HistoryEventRefundItemInterface } from '../interfaces/history-event-message';
import { TransactionHistoryEntryInterface, TransactionRefundItemInterface } from '../interfaces/transaction';
import { TransactionCartItemModel, TransactionModel } from '../models';

@Injectable()
export class TransactionHistoryEntryConverter {

  public static fromHistoryActionCompletedMessage(
    type: string,
    createdAt: Date,
    data: HistoryEventDataInterface,
  ): TransactionHistoryEntryInterface {
    const item: TransactionHistoryEntryInterface = {
      action: type,
      amount: data.amount,
      created_at: createdAt,
      payment_status: data.payment_status,
      reason: data.reason,
    };

    if (data.saved_data) {
      item.upload_items = data.saved_data;
    }

    if (data.items_restocked) {
      item.is_restock_items = data.items_restocked;
    }

    if (data.mail_event) {
      item.mail_event = data.mail_event;
    }

    return item;
  }

  public static fromHistoryRefundCompletedMessage(
    transaction: TransactionModel,
    type: string,
    createdAt: Date,
    data: HistoryEventDataInterface,
  ): TransactionHistoryEntryInterface {
    const history: TransactionHistoryEntryInterface = {
      action: type,
      amount: data.amount,
      created_at: createdAt,
      is_restock_items: data.items_restocked ? data.items_restocked : false,
      payment_status: data.payment_status,
      reason: data.reason,
    };

    history.refund_items = data.refund_items
      ? this.processRefundItems(transaction, data.refund_items)
      : []
    ;

    return history;
  }

  public static fromCheckoutTransactionHistoryItem(
    type: string,
    createdAt: Date,
    data: CheckoutTransactionHistoryItemInterface,
  ): TransactionHistoryEntryInterface {
    const item: TransactionHistoryEntryInterface = {
      action: type,
      amount: data.amount,
      created_at: createdAt,
      payment_status: data.payment_status,
      reason: data.reason,
    };

    if (data.items_restocked) {
      item.is_restock_items = data.items_restocked;
    }

    if (data.params) {
      item.params = Array.isArray(data.params)
        ? {}
        : data.params
      ;
    }

    return item;
  }

  private static processRefundItems(
    transaction: TransactionModel,
    refundItems: HistoryEventRefundItemInterface[],
  ): TransactionRefundItemInterface[] {
    const items: TransactionRefundItemInterface[] = [];

    for (const refundItem of refundItems) {
      const cartItem: TransactionCartItemModel = transaction.items
        .filter(
          (item: TransactionCartItemModel) => refundItem.payment_item_id === item.id,
        )
        .shift()
      ;

      if (cartItem) {
        items.push({
          count: refundItem.count,
          item_uuid: cartItem.id,
        });
      }
    }

    return items;
  }
}
