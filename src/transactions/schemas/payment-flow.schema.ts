import { Schema } from 'mongoose';

export const PaymentFlowSchema = new Schema({
  // flow_id: String

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
  show_amount_fields: Boolean,
  step: String,
  state: String,
  origin: String,
  express: Boolean,
  created_at: String, // don't need dates here
  updated_at: String, // don't need dates here
  shop_url: String,
});

// {
  // shipping_method_code: '',
  // shipping_method_name: '',
  // tax_value: 0,
  // currency: 'EUR',
  // reference: 'XYZ',
  // salutation: 'SALUTATION_MR',
  // first_name: 'Baldes',
  // last_name: 'Sarini',
  // country: 'DE',
  // city: 'Köln',
  // zip_code: '50676',
  // street: 'Balduinstraße 1',
  // show_amount_fields: true,
  // step: 'payment_step.initialize',
  // state: 'FINISHED',
  // origin: 'restapi.v2',
  // express: false,
  // created_at: '2018-11-15T12:17:55+00:00',
  // updated_at: '2018-11-15T12:27:24+00:00',
  // shop_url: 'https://pos-client.devpayever.com'
// }
