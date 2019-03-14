import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { TransactionRefundItemSchema } from './transaction-refund-item.schema';
import { TransactionUploadItemSchema } from './transaction-upload-item.schema';

export const TransactionHistoryEntrySchema = new Schema({
  _id: { type: String, default: uuid },
  action: String,
  amount: Number,
  created_at: Date,
  is_restock_items: Boolean,
  params: String,
  payment_status: String,
  reason: String,
  upload_items: [TransactionUploadItemSchema],
  refund_items: [TransactionRefundItemSchema],
});
