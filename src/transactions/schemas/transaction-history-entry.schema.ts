import { Schema } from 'mongoose';
import { TransactionRefundItemSchema } from './transaction-refund-item.schema';
import { TransactionUploadItemSchema } from './transaction-upload-item.schema';
import { TransactionMailEventSchema } from './transaction-mail-event.schema';
import { TransactionHistoryUserSchema } from './transaction-history-user.schema';

export const TransactionHistoryEntrySchema: Schema = new Schema({
  // _id: { type: String, default: uuid },
  action: String,
  amount: Number,
  created_at: Date,
  is_restock_items: Boolean,
  params: Schema.Types.Mixed,
  payment_status: String,
  reason: String,
  reference: String,

  mail_event: TransactionMailEventSchema,
  refund_items: [TransactionRefundItemSchema],
  upload_items: [TransactionUploadItemSchema],

  user: TransactionHistoryUserSchema,
});
