import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

export const TransactionRefundItemSchema = new Schema({
  _id: { type: String, default: uuid },
  // uuid: String,
  item_uuid: String,
  count: Number,
});
