import { Schema } from 'mongoose';

export const TransactionRefundItemSchema: Schema = new Schema({
  count: Number,
  item_uuid: String,
});
