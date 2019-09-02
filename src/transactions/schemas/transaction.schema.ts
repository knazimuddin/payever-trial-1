import { Schema } from 'mongoose';
import {
  TransactionCartItemInterface,
  TransactionHistoryEntryInterface,
  TransactionRefundItemInterface,
} from '../interfaces/transaction';
import { AddressSchema } from './address.schema';
import { TransactionCartItemSchema } from './transaction-cart-item-schema';
import { TransactionHistoryEntrySchema } from './transaction-history-entry.schema';

export const TransactionSchemaName: string = 'Transaction';

export const TransactionSchema: Schema = new Schema({
  /** Original id for legacy purposes */
  original_id: { type: String, unique: true },
  uuid: { type: String, required: true, unique: true },

  action_running: { type: Boolean, required: false, default: false },
  amount: Number,
  billing_address: AddressSchema,
  business_option_id: Number,
  business_uuid: { type: String },

  channel: String,
  channel_set_uuid: String,
  channel_uuid: String,

  customer_email: { type: String },
  customer_name: { type: String, required: true },

  shipping_address: { type: AddressSchema },
  shipping_category: String,
  shipping_method_name: String,
  shipping_option_name: String,
  shipping_order_id: String,
  specific_status: String,

  created_at: { type: Date, required: true },
  currency: { type: String, required: true },
  delivery_fee: Number,
  down_payment: Number,
  fee_accepted: Boolean,
  history: [TransactionHistoryEntrySchema],
  invoice_id: String,
  items: [TransactionCartItemSchema],
  merchant_email: String,
  merchant_name: String,
  /** Serialized big object */
  payment_details: String,
  payment_fee: Number,
  payment_flow_id: String,
  place: String,
  reference: String,
  santander_applications: [String],

  status: { type: String, required: true },
  status_color: {type: String},
  store_id: String,
  store_name: String,
  total: { type: Number, required: true},
  type: { type: String, required: true },
  updated_at: Date,
  user_uuid: String,

  example: Boolean,
  example_shipping_label: String,
});

TransactionSchema.index({ uuid: 1});
TransactionSchema.index({ santander_applications: 1});
TransactionSchema.index({ original_id: 1});
TransactionSchema.index({ reference: 1});
TransactionSchema.index({ customer_name: 1});
TransactionSchema.index({ customer_email: 1});
TransactionSchema.index({ merchant_name: 1});
TransactionSchema.index({ merchant_email: 1});
TransactionSchema.index({ status: 1, _id: 1 });

TransactionSchema.virtual('amount_refunded').get(function(): number {
  let totalRefunded: number = 0;

  if (this.history) {
    this.history
      .filter((entry: { action: string }) => entry.action === 'refund' || entry.action === 'return')
      .forEach((entry: { amount: number }) => totalRefunded += (entry.amount || 0))
    ;
  }

  return totalRefunded;
});

TransactionSchema.virtual('amount_rest').get(function(): number {
  return this.amount - this.amount_refunded;
});

TransactionSchema.virtual('available_refund_items').get(function(): TransactionRefundItemInterface[] {
  const refundItems: TransactionRefundItemInterface[] = [];

  this.items.forEach((item: TransactionCartItemInterface) => {
    let availableCount: number = item.quantity;

    if (this.history) {
      this.history.forEach((historyEntry: TransactionHistoryEntryInterface) => {
        if (historyEntry.refund_items) {
          const refundedLog: TransactionRefundItemInterface = historyEntry.refund_items.find(
            (refundedItem: TransactionRefundItemInterface) => item.uuid === refundedItem.item_uuid,
          );

          if (refundedLog && refundedLog.count) {
            availableCount -= refundedLog.count;
          }
        }
      });
    }

    if (availableCount > 0) {
      refundItems.push({
        count: availableCount,
        item_uuid: item.uuid,
      });
    }
  });

  return refundItems;
});
