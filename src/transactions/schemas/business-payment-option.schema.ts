import { Schema } from 'mongoose';

const CredentialsSchema = new Schema({
  vendorNumber: String,
  password: String,
  isDownPaymentAllowed: Boolean,
  isEmailNotificationAllowed: Boolean,
  clickAndCollect: Boolean,
});

export const BusinessPaymentOptionSchema = new Schema({
  payment_option_id: Number,
  id: Number,
  accept_fee: Boolean,
  status: String,
  fixed_fee: Number,
  variable_fee: Number,
  credentials: CredentialsSchema,
  options: String, // json of options array
  completed: Boolean,
  shop_redirect_enabled: Boolean,
  uuid: String,
});


// {
  // payment_option_id: 9,
  // id: 2568,
  // accept_fee: false,
  // status: 'enabled',
  // fixed_fee: 0,
  // variable_fee: 0,
  // credentials:
   // { vendorNumber: '8207777400',
     // password: 'NetAdam123',
     // isDownPaymentAllowed: true,
     // isEmailNotificationAllowed: false,
     // clickAndCollect: false },
  // options: [],
  // completed: true,
  // shop_redirect_enabled: false,
  // uuid: '608d848c-af3a-11e7-8ccc-525400000108'
// }
