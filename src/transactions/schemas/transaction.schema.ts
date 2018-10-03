import { Schema } from 'mongoose';

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
  street: String,
  type: String, // 'billing' | 'shipping'
  zip_code: String,
});

export const TransactionItemSchema = new Schema({
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
  uuid: String,
  vat_rate: Number,
  weight: Number,
});

export const TransactionRefundItemSchema = new Schema({
  // uuid: String,
  item_uuid: String,
  count: Number,
});

export const TransactionHistoryEntrySchema = new Schema({
  action: String,
  amount: Number,
  created_at: Date,
  // custom_data: any[],
  is_restock_items: Boolean,
  params: String,
  payment_status: String,
  reason: String,
  refund_items: [TransactionRefundItemSchema],
  // uuid: String,
});

export const TransactionsSchema = new Schema({
  amount: Number,
  // amount_refunded: Number,
  // amount_rest: Number,
  // available_refund_items: [{
    // payment_item_id: String,
    // count: 1,
  // }],
  billing_address: AddressSchema,
  // business_address - will be resolved on FE via business_uuid
  business_uuid: {type: String, required: true},
  channel: String, // 'store', ...
  created_at: {type: Date, required: true},
  currency: {type: String, required: true},
  customer_email: {type: String, required: true},
  customer_name: {type: String, required: true},
  delivery_fee: Number,
  down_payment: Number,
  fee_accepted: Boolean,
  history: [TransactionHistoryEntrySchema],
  items: [TransactionItemSchema],
  merchant_email: String,
  merchant_name: String,
  payment_details: String, // Serialized big object
  payment_fee: Number,
  reference: String,
  shipping_address: {type: AddressSchema},
  shipping_category: String,
  shipping_method_name: String,
  shipping_option_name: String,
  specific_status: String,
  status: {type: String, required: true},
  status_color: {type: String, required: true},
  store_id: String,
  store_name: String,
  total: {type: Number, required: true},
  // total_fee: {type: Number, required: true},
  type: {type: String, required: true},
  updated_at: Date,
  uuid: {type: String, required: true},
});

TransactionsSchema.virtual('amount_refunded').get(function() {
  let totalRefunded = 0;

  if (this.history) {
    this.history
      .filter((entry) => entry.action === 'refund')
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
