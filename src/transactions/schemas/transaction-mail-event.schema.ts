import { Schema } from 'mongoose';

export const TransactionMailEventSchema: Schema = new Schema({
  event_id: String,
  template_name: String,
});
