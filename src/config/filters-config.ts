import {
  FilterOptionInterface,
  FilterOptionTypeEnum,
  FiltersService,
  TranslationPrefixEnum,
  ValuesService,
  PaymentOptionsEnum,
} from '@pe/common-sdk';
import {
  PaymentStatusesEnum,
  PaymentSpecificStatusEnum,
} from '../transactions/enum';

export const FiltersConfig: FilterOptionInterface[] = [
  {
    fieldName: 'original_id',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'transactions.values.filter_labels.original_id',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'reference',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'transactions.values.filter_labels.reference',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'created_at',
    filterConditions: FiltersService.getDateFilterConditions(),
    label: 'transactions.values.filter_labels.created_at',
    type: FilterOptionTypeEnum.date,
  },
  {
    fieldName: 'type',
    filterConditions: FiltersService.getOptionConditions(),
    label: 'transactions.values.filter_labels.payment_option',
    options: ValuesService.getChoices(TranslationPrefixEnum.integrationsPayments, PaymentOptionsEnum, 'title'),
    type: FilterOptionTypeEnum.option,
  },
  {
    fieldName: 'status',
    filterConditions: FiltersService.getOptionConditions(),
    label: 'transactions.values.filter_labels.status',
    options: ValuesService.getChoices(TranslationPrefixEnum.transactionStatuses, PaymentStatusesEnum),
    type: FilterOptionTypeEnum.option,
  },
  {
    fieldName: 'specific_status',
    filterConditions: FiltersService.getOptionConditions(),
    label: 'transactions.values.filter_labels.specific_status',
    options: ValuesService.getChoices(TranslationPrefixEnum.transactionSpecificStatus, PaymentSpecificStatusEnum),
    type: FilterOptionTypeEnum.option,
  },
  {
    fieldName: 'channel',
    filterConditions: FiltersService.getOptionConditions(),
    label: 'transactions.values.filter_labels.channel',
    options: ValuesService.getChannelValuesChoices(),
    type: FilterOptionTypeEnum.option,
  },
  {
    fieldName: 'amount',
    filterConditions: FiltersService.getNumberFilterConditions(),
    label: 'transactions.values.filter_labels.amount',
    type: FilterOptionTypeEnum.number,
  },
  {
    fieldName: 'total',
    filterConditions: FiltersService.getNumberFilterConditions(),
    label: 'transactions.values.filter_labels.total',
    type: FilterOptionTypeEnum.number,
  },
  {
    fieldName: 'currency',
    filterConditions: FiltersService.getOptionConditions(),
    label: 'transactions.values.filter_labels.currency',
    // options filled in sdk for fieldName currency
    type: FilterOptionTypeEnum.option,
  },
  {
    fieldName: 'customer_name',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'transactions.values.filter_labels.customer_name',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'customer_email',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'transactions.values.filter_labels.customer_email',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'merchant_name',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'transactions.values.filter_labels.merchant_name',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'merchant_email',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'transactions.values.filter_labels.merchant_email',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'seller_name',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'transactions.values.filter_labels.seller_name',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'seller_email',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'transactions.values.filter_labels.seller_email',
    type: FilterOptionTypeEnum.string,
  },
];
