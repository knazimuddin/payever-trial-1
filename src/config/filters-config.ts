import {
  FilterOptionInterface,
  FilterOptionTypeEnum,
  FiltersService,
  FiltersTranslationPrefix,
  ValuesService,
  PaymentOptionsEnum,
  ChannelTypesEnum,
} from '@pe/common-sdk';
import {
  PaymentStatusesEnum,
  PaymentSpecificStatusEnum,
} from '../transactions/enum';

export const FiltersConfig: FilterOptionInterface[] = [
  {
    fieldName: 'original_id',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'filters.original_id',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'reference',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'filters.reference',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'date',
    filterConditions: FiltersService.getDateFilterConditions(),
    label: 'filters.date',
    type: FilterOptionTypeEnum.date,
  },
  {
    fieldName: 'type',
    filterConditions: FiltersService.getOptionConditions(),
    label: 'filters.payment_option',
    options: ValuesService.getChoices(FiltersTranslationPrefix.paymentOption, PaymentOptionsEnum),
    type: FilterOptionTypeEnum.option,
  },
  {
    fieldName: 'status',
    filterConditions: FiltersService.getOptionConditions(),
    label: 'filters.status',
    options: ValuesService.getChoices(FiltersTranslationPrefix.status, PaymentStatusesEnum),
    type: FilterOptionTypeEnum.option,
  },
  {
    fieldName: 'specific_status',
    filterConditions: FiltersService.getOptionConditions(),
    label: 'filters.specific_status',
    options: ValuesService.getChoices(FiltersTranslationPrefix.specificStatus, PaymentSpecificStatusEnum),
    type: FilterOptionTypeEnum.option,
  },
  {
    fieldName: 'channel',
    filterConditions: FiltersService.getOptionConditions(),
    label: 'filters.channel',
    options: ValuesService.getChoices(FiltersTranslationPrefix.channelType, ChannelTypesEnum),
    type: FilterOptionTypeEnum.option,
  },
  {
    fieldName: 'amount',
    filterConditions: FiltersService.getNumberFilterConditions(),
    label: 'filters.amount',
    type: FilterOptionTypeEnum.number,
  },
  {
    fieldName: 'total',
    filterConditions: FiltersService.getNumberFilterConditions(),
    label: 'filters.total',
    type: FilterOptionTypeEnum.number,
  },
  {
    fieldName: 'currency',
    filterConditions: FiltersService.getOptionConditions(),
    label: 'filters.currency',
    // options filled in sdk for fieldName currency
    type: FilterOptionTypeEnum.option,
  },
  {
    fieldName: 'customer_name',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'filters.customer_name',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'customer_email',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'filters.customer_email',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'merchant_name',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'filters.merchant_name',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'merchant_email',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'filters.merchant_email',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'seller_name',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'filters.seller_name',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'seller_email',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'filters.seller_email',
    type: FilterOptionTypeEnum.string,
  },
];
