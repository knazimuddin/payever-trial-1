import { Schema } from 'mongoose';

export const PaymentFlowSchemaName: string = 'PaymentFlow';

export const PaymentFlowSchema: Schema = new Schema(
  {
    id: String,

    amount: Number,
    currency: String,

    first_name: String,
    last_name: String,

    city: String,
    country: String,
    street: String,
    zip_code: String,

    shipping_fee: Number,
    shipping_method_code: String,
    shipping_method_name: String,

    callback: String,
    channel_set_uuid: String,
    express: Boolean,
    origin: String,
    reference: String,
    salutation: String,
    seller_email: String,
    state: String,
    step: String,
    tax_value: Number,
    x_frame_host: String,
  },
  {
    id: false,
    timestamps: { },
  },
);

PaymentFlowSchema.index({ id: 1 });
PaymentFlowSchema.index({ channel_set_uuid: 1 });
PaymentFlowSchema.index({ reference: 1 });
PaymentFlowSchema.index({ state: 1 });
