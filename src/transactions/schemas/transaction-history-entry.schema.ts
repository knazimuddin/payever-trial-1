import { Schema } from 'mongoose';
import { TransactionRefundItemSchema } from './transaction-refund-item.schema';
import { TransactionUploadItemSchema } from './transaction-upload-item.schema';

export const TransactionHistoryEntrySchema = new Schema({
  // _id: { type: String, default: uuid },
  action: String,
  amount: Number,
  reference: String,
  created_at: Date,
  is_restock_items: Boolean,
  params: Schema.Types.Mixed,
  payment_status: String,
  reason: String,
  upload_items: [TransactionUploadItemSchema],
  refund_items: [TransactionRefundItemSchema],
});
