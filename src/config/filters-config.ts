import {
  FilterOptionInterface,
  FilterOptionTypeEnum,
  FiltersService,
  TranslationPrefixEnum,
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
    label: 'translation.original_id',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'reference',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'translation.reference',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'created_at',
    filterConditions: FiltersService.getDateFilterConditions(),
    label: 'translation.created_at',
    type: FilterOptionTypeEnum.date,
  },
  {
    fieldName: 'type',
    filterConditions: FiltersService.getOptionConditions(),
    label: 'translation.payment_option',
    options: ValuesService.getChoices(TranslationPrefixEnum.paymentOption, PaymentOptionsEnum),
    type: FilterOptionTypeEnum.option,
  },
  {
    fieldName: 'status',
    filterConditions: FiltersService.getOptionConditions(),
    label: 'translation.status',
    options: ValuesService.getChoices(TranslationPrefixEnum.status, PaymentStatusesEnum),
    type: FilterOptionTypeEnum.option,
  },
  {
    fieldName: 'specific_status',
    filterConditions: FiltersService.getOptionConditions(),
    label: 'translation.specific_status',
    options: ValuesService.getChoices(TranslationPrefixEnum.specificStatus, PaymentSpecificStatusEnum),
    type: FilterOptionTypeEnum.option,
  },
  {
    fieldName: 'channel',
    filterConditions: FiltersService.getOptionConditions(),
    label: 'translation.channel',
    options: ValuesService.getChoices(TranslationPrefixEnum.channelType, ChannelTypesEnum),
    type: FilterOptionTypeEnum.option,
  },
  {
    fieldName: 'amount',
    filterConditions: FiltersService.getNumberFilterConditions(),
    label: 'translation.amount',
    type: FilterOptionTypeEnum.number,
  },
  {
    fieldName: 'total',
    filterConditions: FiltersService.getNumberFilterConditions(),
    label: 'translation.total',
    type: FilterOptionTypeEnum.number,
  },
  {
    fieldName: 'currency',
    filterConditions: FiltersService.getOptionConditions(),
    label: 'translation.currency',
    // options filled in sdk for fieldName currency
    type: FilterOptionTypeEnum.option,
  },
  {
    fieldName: 'customer_name',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'translation.customer_name',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'customer_email',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'translation.customer_email',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'merchant_name',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'translation.merchant_name',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'merchant_email',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'translation.merchant_email',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'seller_name',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'translation.seller_name',
    type: FilterOptionTypeEnum.string,
  },
  {
    fieldName: 'seller_email',
    filterConditions: FiltersService.getStringFilterConditions(),
    label: 'translation.seller_email',
    type: FilterOptionTypeEnum.string,
  },
];
