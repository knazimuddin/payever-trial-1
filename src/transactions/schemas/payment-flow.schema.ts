import { Schema } from 'mongoose';

export const PaymentFlowSchema = new Schema({
  id: String,
  amount: Number,
  shipping_fee: Number,
  shipping_method_code: String,
  shipping_method_name: String,
  tax_value: Number,
  currency: String,
  reference: String,
  salutation: String,
  first_name: String,
  last_name: String,
  country: String,
  city: String,
  zip_code: String,
  street: String,
  channel_set_uuid: String,
  step: String,
  state: String,
  origin: String,
  express: Boolean,
  callback: String,
  x_frame_host: String,
});