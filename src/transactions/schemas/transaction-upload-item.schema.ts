import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

export const TransactionUploadItemSchema = new Schema({
  _id: { type: String, default: uuid },
  type: String,
  name: String,
});
