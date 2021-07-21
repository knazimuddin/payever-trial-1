import { environment } from '../environments';
import { ElasticConfigInterface } from '@pe/folders-plugin/module/interfaces';

export const ElasticConfig: ElasticConfigInterface = {
  env: {
    elasticSearchAuthPassword: environment.elasticSearchAuthPassword,
    elasticSearchAuthUsername: environment.elasticSearchAuthUsername,
    elasticSearchCloudId: environment.elasticSearchCloudId,
    elasticSearchHost: environment.elasticSearchHost,
  },
  fieldsMapping: {
    amount: {
      type: 'long',
    },
    channel: {
      fielddata: true,
      type: 'text',
    },
    currency: {
      fielddata: true,
      type: 'text',
    },
    customer_name: {
      fielddata: true,
      type: 'text',
    },
    delivery_fee: {
      type: 'long',
    },
    down_payment: {
      type: 'long',
    },
    example: {
      type: 'boolean',
    },
    merchant_name: {
      fielddata: true,
      type: 'text',
    },
    mongoId: {
      fielddata: true,
      type: 'text',
    },
    original_id: {
      fielddata: true,
      type: 'text',
    },
    payment_fee: {
      type: 'long',
    },
    specific_status: {
      fielddata: true,
      type: 'text',
    },
    status: {
      fielddata: true,
      type: 'text',
    },
    total: {
      type: 'long',
    },
    type: {
      fielddata: true,
      type: 'text',
    },


    'items.fixed_shipping_price' : {
      type: 'long',
    },
    'items.price' : {
      type: 'long',
    },
    'items.price_net' : {
      type: 'long',
    },
    'items.shipping_price' : {
      type: 'long',
    },
    'items.shipping_settings_rate' : {
      type: 'long',
    },
    'items.vat_rate' : {
      type: 'long',
    },
    'items.weight' : {
      type: 'long',
    },
  },
  index: {
    businessIdField: 'business_uuid',
    collection: 'transactions',
    documentIdField: 'uuid',
    type: 'transaction',
  },
  searchFields: [
    'original_id^1',
    'customer_name^1',
    'merchant_name^1',
    'reference^1',
    'payment_details.finance_id^1',
    'payment_details.application_no^1',
    'customer_email^1',
  ],
};
