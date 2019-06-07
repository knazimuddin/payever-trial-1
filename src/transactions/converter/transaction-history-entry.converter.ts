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
    return {
      action: type,
      amount: data.amount,
      payment_status: data.payment_status,
      reason: data.reason,
      created_at: createdAt,
    };
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
      payment_status: data.payment_status,
      reason: data.reason,
      is_restock_items: data.items_restocked ? data.items_restocked : false,
      created_at: createdAt,
    };

    history.refund_items = data.refund_items
      ? this.processRefundItems(transaction, data.refund_items)
      : []
    ;

    return history;
  }

  public static fromCheckoutTransactionHistoryItem(
    historyType: string,
    createdAt: Date,
    data: CheckoutTransactionHistoryItemInterface,
  ): TransactionHistoryEntryInterface {
    return {
      action: historyType,
      payment_status: data.payment_status,
      amount: data.amount,
      params: data.params,
      created_at: createdAt,
      is_restock_items: data.items_restocked
        ? data.items_restocked
        : null
      ,
      reason: data.reason,
    };
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
          item_uuid: cartItem.id,
          count: refundItem.count,
        });
      }
    }

    return items;
  }
}
