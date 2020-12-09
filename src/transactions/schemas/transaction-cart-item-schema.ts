import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

export const TransactionCartItemSchema: Schema = new Schema({
  _id: String,
  uuid: String,

  created_at: Date,
  description: String,
  fixed_shipping_price: Number,
  identifier: String,
  item_type: String,
  name: String,
  options: [{ _id: String, name: String, value: String }],
  price: Number,
  price_net: Number,
  product_variant_uuid: String,
  quantity: Number,
  shipping_price: Number,
  shipping_settings_rate: Number,
  shipping_settings_rate_type: String,
  shipping_type: String,
  sku: String,
  thumbnail: String,
  updated_at: Date,
  url: String,
  vat_rate: Number,
  weight: Number,
});

TransactionCartItemSchema.post('init', function(): void {
  this.uuid = this.uuid || this._id;
});
