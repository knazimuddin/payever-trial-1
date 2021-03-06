import { Schema } from 'mongoose';

export const BusinessPaymentOptionSchemaName: string = 'BusinessPaymentOption';

export const BusinessPaymentOptionSchema: Schema = new Schema(
  {
    id: { type: Number, unique: true },
    uuid: { type: String, unique: true },

    accept_fee: Boolean,
    business_uuid: String,
    completed: Boolean,
    credentials: Schema.Types.Mixed,
    fixed_fee: Number,
    /** json of array options */
    options: String,
    payment_method: String,
    payment_option_id: Number,
    shop_redirect_enabled: Boolean,
    status: String,
    variable_fee: Number,
  },
  {
    id: false,
  },
)
  .index({ business_uuid: 1, completed: 1, payment_method: 1, status: 1 });
