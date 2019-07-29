import { Schema } from 'mongoose';

export const TransactionUploadItemSchema = new Schema({
  // _id: { type: String, default: uuid },
  type: String,
  name: String,
});
