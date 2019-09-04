export const ElasticMappingFieldsConfig: { [field: string]: {} } = {
  amount: {
    scaling_factor: 100,
    type: 'scaled_float',
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
  specific_status: {
    fielddata: true,
    type: 'text',
  },
  status: {
    fielddata: true,
    type: 'text',
  },
  total: {
    scaling_factor: 100,
    type: 'scaled_float',
  },
  type: {
    fielddata: true,
    type: 'text',
  },

  'items.price' : {
    fielddata: true,
    type: 'text',
  },
};
