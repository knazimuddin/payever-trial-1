import { Schema } from 'mongoose';

export const TransactionHistoryUserSchema: Schema = new Schema(
  {
    email: String,
    first_name: String,
    id: String,
    last_name: String,
  },
  {
    _id: false,
  },
);
