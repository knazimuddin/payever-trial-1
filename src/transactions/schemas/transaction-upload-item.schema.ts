import { Schema } from 'mongoose';

export const TransactionUploadItemSchema = new Schema({
  type: String,
  name: String,
});
