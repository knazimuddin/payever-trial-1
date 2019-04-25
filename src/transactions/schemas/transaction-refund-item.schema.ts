import { Schema } from 'mongoose';

export const TransactionRefundItemSchema = new Schema({
  item_uuid: String,
  count: Number,
});
