import { Schema } from 'mongoose';

import { TransactionCartItemInterface, TransactionRefundItemInterface } from '../../transactions/interfaces/transaction';
import { AddressSchema, TransactionCartItemSchema, TransactionHistoryEntrySchema } from '../../transactions/schemas';
import { PaymentActionsEnum } from '../../transactions/enum';

export const TransactionsArchiveSchemaName: string = 'TransactionsArchive';

export const TransactionsArchiveSchema: Schema = new Schema(
{
  archiveEmail: {
    required: true,
    type: String,
  },
  businessId: {
    required: true,
    type: String,
  },

  /*
   * Transaction schame (synced 2022.02.04)
   */

  /** Original id for legacy purposes */
  original_id: { type: String, unique: true },
  uuid: { type: String, required: true, unique: true },

  api_call_id: { type: String, required: false },

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

  is_shipping_order_processed: Boolean,
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

  captured_items: [TransactionCartItemSchema],
  items: [TransactionCartItemSchema],
  refunded_items: [TransactionCartItemSchema],

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
  status_color: { type: String },
  store_id: String,
  store_name: String,
  total: { type: Number, required: true },
  type: { type: String, required: true },
  updated_at: Date,
  user_uuid: String,

  seller_email: String,
  seller_name: String,

  example: Boolean,
  example_shipping_label: String,
  example_shipping_slip: String,
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

TransactionsArchiveSchema.index({ santander_applications: 1 });
TransactionsArchiveSchema.index({ reference: 1 });
TransactionsArchiveSchema.index({ customer_name: 1 });
TransactionsArchiveSchema.index({ customer_email: 1 });
TransactionsArchiveSchema.index({ merchant_name: 1 });
TransactionsArchiveSchema.index({ merchant_email: 1 });
TransactionsArchiveSchema.index({ status: 1, _id: 1 });
TransactionsArchiveSchema.index({ business_uuid: 1 });
TransactionsArchiveSchema.index({ example: 1 });
TransactionsArchiveSchema.index({ type: 1 });
TransactionsArchiveSchema.index({ created_at: -1 });
TransactionsArchiveSchema.index({ created_at: 1 });
TransactionsArchiveSchema.index({ business_uuid: 1, example: 1 });

TransactionsArchiveSchema.virtual('amount_refunded').get(function (): number {
  let totalRefunded: number = 0;

  if (this.history) {
    this.history
      .filter((entry: { action: string }) =>
        entry.action === PaymentActionsEnum.Refund
        || entry.action === PaymentActionsEnum.Return,
      )
      .forEach((entry: { amount: number }) => totalRefunded += (entry.amount || 0))
      ;
  }

  return Math.round((totalRefunded + Number.EPSILON) * 100) / 100;
});

TransactionsArchiveSchema.virtual('amount_captured').get(function (): number {
  let totalCaptured: number = 0;

  if (this.history) {
    this.history
      .filter((entry: { action: string }) => entry.action === PaymentActionsEnum.ShippingGoods)
      .forEach((entry: { amount: number }) => totalCaptured += (entry.amount || 0))
      ;
  }

  return Math.round((totalCaptured + Number.EPSILON) * 100) / 100;
});

/**
 * @deprecated use amount_left instead of amount_refund_rest
 */
TransactionsArchiveSchema.virtual('amount_refund_rest').get(function (): number {
  return Math.round((this.amount - this.amount_refunded + Number.EPSILON) * 100) / 100;
});

TransactionsArchiveSchema.virtual('amount_capture_rest').get(function (): number {
  const amountCaptureRest: number =
    Math.round((this.total - this.amount_captured - this.amount_refunded + Number.EPSILON) * 100) / 100;

  return amountCaptureRest >= 0 ? amountCaptureRest : 0;
});

TransactionsArchiveSchema.virtual('available_refund_items').get(function (): TransactionRefundItemInterface[] {
  const refundItems: TransactionRefundItemInterface[] = [];

  this.items.forEach((item: TransactionCartItemInterface) => {
    let availableCount: number = item.quantity;

    if (this.refunded_items) {
      const existingRefundItem: TransactionCartItemInterface = this.refunded_items.find(
        (refundedItem: TransactionCartItemInterface) => item.identifier === refundedItem.identifier,
      );

      if (existingRefundItem && existingRefundItem.quantity) {
        availableCount -= existingRefundItem.quantity;
      }
    }

    if (availableCount > 0) {
      refundItems.push({
        count: availableCount,
        identifier: item.identifier,
        item_uuid: item.uuid,
      });
    }
  });

  return refundItems;
});

TransactionsArchiveSchema.virtual('amount_left').get(function (): number {
  if (this.status === 'STATUS_CANCELLED') {
    return this.amount;
  } else {
    return Math.round((this.amount - this.amount_refunded + Number.EPSILON) * 100) / 100;
  }
});

TransactionsArchiveSchema.virtual('total_left').get(function (): number {
  if (this.status === 'STATUS_CANCELLED') {
    return this.total;
  } else {
    return Math.round((this.total - this.amount_refunded + Number.EPSILON) * 100) / 100;
  }
});
