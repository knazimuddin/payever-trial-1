import { Schema } from 'mongoose';
import { AddressSchema } from './address.schema';
import { TransactionCartItemSchema } from './transaction-cart-item-schema';
import { TransactionHistoryEntrySchema } from './transaction-history-entry.schema';

export const TransactionExampleSchemaName: string = 'TransactionExample';

export const TransactionExampleSchema: Schema = new Schema({

  action_running: Boolean,
  amount: Number,
  billing_address: AddressSchema,
  business_option_id: Number,

  channel: String,
  channel_set_uuid: String,
  channel_uuid: String,

  customer_email: String,
  customer_name: String,

  shipping_address: AddressSchema,
  shipping_category: String,
  shipping_method_name: String,
  shipping_option_name: String,
  specific_status: String,

  currency: String,
  delivery_fee: Number,
  down_payment: Number,
  fee_accepted: Boolean,
  history: [TransactionHistoryEntrySchema],
  invoice_id: String,
  items: [TransactionCartItemSchema],
  payment_details: String,
  payment_fee: Number,
  payment_flow_id: String,
  place: String,
  reference: String,
  santander_applications: [String],

  status: String,
  status_color: {type: String},
  store_id: String,
  store_name: String,
  total: Number,
  type: String,

  country: String,

  // original_id: { type: String, unique: true },
  // uuid: { type: String, required: true, unique: true },
  // business_uuid: String,
  // created_at: Date,
  // merchant_email: String,
  // merchant_name: String,
  // updated_at: Date,
  // user_uuid: String,
});
