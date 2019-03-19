import { Schema } from 'mongoose';

export const TransactionRefundItemSchema = new Schema({
  // _id: { type: String, default: uuid },
  // uuid: String,
  item_uuid: String,
  count: Number,
});
