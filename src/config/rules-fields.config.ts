import { ConditionsService, RulesSdkOptionsInterface, RuleActionEnum } from '@pe/rules-sdk';
import { RabbitChannels } from '../enums';

export const RulesOptions: RulesSdkOptionsInterface = {
  actions: [
    RuleActionEnum.copy,
    RuleActionEnum.move,
  ],
  consumerChannel: RabbitChannels.TransactionsFolders,
  fields: [
    {
      conditions: ConditionsService.getStringConditions(),
      fieldName: 'original_id',
      label: 'filters.original_id',
    },
    {
      conditions: ConditionsService.getStringConditions(),
      fieldName: 'reference',
      label: 'filters.reference',
    },
    {
      conditions: ConditionsService.getNumberConditions(),
      fieldName: 'date',
      label: 'filters.date',
    },
    {
      conditions: ConditionsService.getStringConditions(),
      fieldName: 'type',
      label: 'filters.payment_option',
    },
    {
      conditions: ConditionsService.getStringConditions(),
      fieldName: 'status',
      label: 'filters.status',
    },
    {
      conditions: ConditionsService.getStringConditions(),
      fieldName: 'specific_status',
      label: 'filters.specific_status',
    },
    {
      conditions: ConditionsService.getStringConditions(),
      fieldName: 'channel',
      label: 'filters.channel',
    },
    {
      conditions: ConditionsService.getNumberConditions(),
      fieldName: 'amount',
      label: 'filters.amount',
    },
    {
      conditions: ConditionsService.getNumberConditions(),
      fieldName: 'total',
      label: 'filters.total',
    },
    {
      conditions: ConditionsService.getNumberConditions(),
      fieldName: 'currency',
      label: 'filters.currency',
    },
    {
      conditions: ConditionsService.getStringConditions(),
      fieldName: 'customer_name',
      label: 'filters.customer_name',
    },
    {
      conditions: ConditionsService.getStringConditions(),
      fieldName: 'customer_email',
      label: 'filters.customer_email',
    },
    {
      conditions: ConditionsService.getStringConditions(),
      fieldName: 'merchant_name',
      label: 'filters.merchant_name',
    },
    {
      conditions: ConditionsService.getStringConditions(),
      fieldName: 'merchant_email',
      label: 'filters.merchant_email',
    },
    {
      conditions: ConditionsService.getStringConditions(),
      fieldName: 'seller_name',
      label: 'filters.seller_name',
    },
    {
      conditions: ConditionsService.getStringConditions(),
      fieldName: 'seller_email',
      label: 'filters.seller_email',
    },
  ],

  useBusiness: true,
};
