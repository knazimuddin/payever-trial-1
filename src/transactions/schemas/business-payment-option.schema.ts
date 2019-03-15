import { Schema } from 'mongoose';

export const BusinessPaymentOptionSchema = new Schema(
  {
    // _id: { type: String },
    id: { type: Number, unique: true },
    uuid: { type: String, unique: true },
    payment_option_id: Number,
    accept_fee: Boolean,
    status: String,
    fixed_fee: Number,
    variable_fee: Number,
    credentials: Schema.Types.Mixed,
    options: String, // json of options array
    completed: Boolean,
    shop_redirect_enabled: Boolean,
  },
  {
    id: false,
  },
);

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
