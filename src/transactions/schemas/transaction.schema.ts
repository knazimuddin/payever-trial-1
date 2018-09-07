import { Schema } from 'mongoose';

export const AddressSchema = new Schema({
  city: String,
  company_name: String,
  country: String, // code like de/en
  country_name: String,
  fax: String,
  first_name: String,
  last_name: String,
  mobile_phone: String,
  phone: String,
  salutation: String,
  social_security_number: String,
  street: String,
  type: String, // 'billing' | 'shipping'
  zip_code: String,
});

export const TransactionItemSchema = new Schema({
  // created_at: Date,
  description: String,
  fixed_shipping_price: Number,
  identifier: String,
  item_type: String,
  name: String,
  price: Number,
  price_net: Number,
  // product_variant_uuid: String,
  quantity: Number,
  // shipping_price: Number,
  // shipping_settings_rate: Number,
  // shipping_settings_rate_type: String,
  shipping_type: String,
  thumbnail: String,
  // updated_at: Date,
  url: String,
  uuid: Number,
  vat_rate: Number,
  // weight: Number,
});

export const TransactionsSchema = new Schema({
  amount: Number,
  amount_refunded: Number,
  amount_rest: Number,
  // available_refund_items: [{
    // payment_item_id: String,
    // count: 1,
  // }],
  billing_address: AddressSchema,
  // business_address - will be resolved on FE via business_uuid
  business_uuid: String,
  channel: String, // 'store', ...
  created_at: Date,
  currency: String,
  customer_email: String,
  customer_name: String,
  delivery_fee: Number,
  down_payment: Number,
  fee_accepted: Boolean,
  items: [TransactionItemSchema],
  merchant_email: String,
  merchant_name: String,
  payment_details: String, // Serialized big object
  payment_fee: Number,
  reference: String,
  shipping_address: AddressSchema,
  shipping_category: String,
  shipping_method_name: String,
  shipping_option_name: String,
  specific_status: String,
  status: String,
  status_color: String,
  store_id: String,
  store_name: String,
  total: Number,
  total_fee: Number,
  type: String,
  // updated_at: Date,
  uuid: String,
});

export const TransactionLogEntrySchema = new Schema({
  action: String,
  amount: Number,
  created_at: String,
  is_restock_items: Boolean,
  params: String,
  payment_status: String,
  reason: String,
  uuid: String,
});

export const TransactionsLogSchema = new Schema({
  transaction_uuid: String,
  log: [TransactionLogEntrySchema],
});
