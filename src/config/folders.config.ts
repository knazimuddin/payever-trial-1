import { FoldersPluginOptionsInterface } from '@pe/folders-plugin';
import { NewElasticTransactionEnum } from '../transactions/enum';
import { environment } from '../environments';
import { TransactionSchemaName, TransactionSchema } from '../transactions/schemas';
import { FiltersConfig } from './filters-config';

export const FoldersConfig: FoldersPluginOptionsInterface<any> = {
  combinedList: false,
  documentSchema: {
    schema: TransactionSchema,
    schemaName: TransactionSchemaName,
  },
  elastic: {
    env: {
      elasticSearchAuthPassword: environment.elasticSearchAuthPassword,
      elasticSearchAuthUsername: environment.elasticSearchAuthUsername,
      elasticSearchCloudId: environment.elasticSearchCloudId,
      elasticSearchHost: environment.elasticSearchHost,
    },

    index: {
      businessIdField: 'business_uuid',
      documentIdField: 'uuid',
      elasticIndex: NewElasticTransactionEnum.index,
      type: NewElasticTransactionEnum.type,
      userIdField: 'user_uuid',
    },

    mappingFields: {
      amount: {
        type: 'long',
      },
      amount_left: {
        type: 'long',
      },
      channel: {
        fielddata: true,
        type: 'text',
      },
      currency: {
        fielddata: true,
        fields: {
          keyword: {
            type: 'keyword',
          },
        },
        type: 'text',
      },
      customer_name: {
        fielddata: true,
        fields: {
          keyword: {
            normalizer: 'case_insensitive',
            type: 'keyword',
          },
        },
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
        type: 'keyword',
      },
      payment_fee: {
        type: 'long',
      },
      specific_status: {
        fielddata: true,
        fields: {
          keyword: {
            type: 'keyword',
          },
        },
        type: 'text',
      },
      status: {
        fielddata: true,
        fields: {
          keyword: {
            type: 'keyword',
          },
        },
        type: 'text',
      },
      total: {
        type: 'long',
      },
      total_left: {
        type: 'long',
      },
      type: {
        fielddata: true,
        type: 'text',
      },

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

    storeFields: [
    ],
  },
  filters: FiltersConfig,
  microservice: 'transactions',
  useBusiness: true,
  useStrictUserScope: false,
  useUserScope: true,
};
