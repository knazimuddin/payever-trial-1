type fieldConfig = {
  type: string,
  fielddata?: boolean,
};

export const ElasticMappingFieldsConfig: {[field: string]: fieldConfig } = {
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
};
