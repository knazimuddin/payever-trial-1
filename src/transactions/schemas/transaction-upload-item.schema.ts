import { Schema } from 'mongoose';

export const TransactionUploadItemSchema: Schema = new Schema({
  name: String,
  type: String,
});
