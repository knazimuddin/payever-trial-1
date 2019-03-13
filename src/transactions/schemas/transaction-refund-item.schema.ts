import { Schema } from 'mongoose';

export const TransactionRefundItemSchema = new Schema({
  // uuid: String,
  item_uuid: String,
  count: Number,
});
