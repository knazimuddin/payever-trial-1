import { FoldersPluginOptionsInterface } from '@pe/folders-plugin';
import { environment } from '../environments';
import { TransactionSchemaName, TransactionSchema } from '../transactions/schemas';
import { FiltersConfig } from './filters-config';

export const FoldersConfig: FoldersPluginOptionsInterface = {
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
  },
  filters: FiltersConfig,
  useBusiness: true,
};
