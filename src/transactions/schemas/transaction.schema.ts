import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

export const AddressSchema = new Schema({
  city: String,
  company: String,
  country: String, // code like de/en
  country_name: String,
  email: String,
  fax: String,
  first_name: String,
  last_name: String,
  mobile_phone: String,
  phone: String,
  salutation: String,
  social_security_number: String,
  type: String, // 'billing' | 'shipping'
  street: String,
  zip_code: String,
});

export const TransactionItemSchema = new Schema({
  _id: String,
  uuid: String,
  created_at: Date,
  description: String,
  fixed_shipping_price: Number,
  identifier: String,
  item_type: String,
  name: String,
  price: Number,
  price_net: Number,
  product_variant_uuid: String,
  quantity: Number,
  shipping_price: Number,
  shipping_settings_rate: Number,
  shipping_settings_rate_type: String,
  shipping_type: String,
  thumbnail: String,
  updated_at: Date,
  url: String,
  vat_rate: Number,
  weight: Number,
});

TransactionItemSchema.post('init', function() {
  this.uuid = this.uuid || this._id;
});

export const TransactionRefundItemSchema = new Schema({
  // uuid: String,
  item_uuid: String,
  count: Number,
});

export const TransactionUploadItemSchema = new Schema({
  type: String,
  name: String,
});

export const TransactionHistoryEntrySchema = new Schema({
  action: String,
  amount: Number,
  created_at: Date,
  is_restock_items: Boolean,
  params: String,
  payment_status: String,
  reason: String,
  upload_items: [TransactionUploadItemSchema],
  refund_items: [TransactionRefundItemSchema],
});

export const TransactionsSchema = new Schema({
  action_running: { type: Boolean, required: false, default: false },
  amount: Number,
  billing_address: AddressSchema,
  business_option_id: Number,
  business_uuid: {type: String},
  channel: String, // 'store', ...
  channel_uuid: String,
  channel_set_uuid: String,
  created_at: {type: Date, required: true},
  currency: {type: String, required: true},
  customer_email: {type: String},
  customer_name: {type: String, required: true},
  delivery_fee: Number,
  down_payment: Number,
  fee_accepted: Boolean,
  history: [TransactionHistoryEntrySchema],
  items: [TransactionItemSchema],
  merchant_email: String,
  merchant_name: String,
  original_id: String, // id from mysql db
  payment_details: String, // Serialized big object
  payment_fee: Number,
  payment_flow_id: String,
  place: String,
  reference: String,
  santander_applications: [String],
  shipping_address: {type: AddressSchema},
  shipping_category: String,
  shipping_method_name: String,
  shipping_option_name: String,
  specific_status: String,
  status: {type: String, required: true},
  status_color: {type: String},
  store_id: String,
  store_name: String,
  total: {type: Number, required: true},
  type: {type: String, required: true},
  updated_at: Date,
  uuid: {type: String, required: true, default: uuid, unique: true},
  user_uuid: String,
});

TransactionsSchema.index('uuid', {unique: true});
TransactionsSchema.index('santander_applications');
TransactionsSchema.index('original_id');
TransactionsSchema.index('reference');
TransactionsSchema.index('customer_name');
TransactionsSchema.index('customer_email');
TransactionsSchema.index('merchant_name');
TransactionsSchema.index('merchant_email');
TransactionsSchema.index({ status: 1, _id: 1 });

TransactionsSchema.virtual('amount_refunded').get(function() {
  let totalRefunded = 0;

  if (this.history) {
    this.history
      .filter((entry) => entry.action === 'refund' || entry.action === 'return')
      .forEach((entry) => totalRefunded += (entry.amount || 0))
    ;
  }

  return totalRefunded;
});

TransactionsSchema.virtual('amount_rest').get(function() {
  return this.amount - this.amount_refunded;
});

TransactionsSchema.virtual('available_refund_items').get(function() {
  const refundItems = [];

  this.items.forEach((item) => {
    let availableCount = item.quantity;

    if (this.history) {
      this.history.forEach((historyEntry) => {
        if (historyEntry.refund_items) {
          const refundedLog = historyEntry.refund_items.find((refundedItem) => item.uuid === refundedItem.item_uuid);

          if (refundedLog && refundedLog.count) {
            availableCount -= refundedLog.count;
          }

        }
      });
    }

    if (availableCount > 0) {
      refundItems.push({
        item_uuid: item.uuid,
        count: availableCount,
      });
    }
  });

  return refundItems;
});
