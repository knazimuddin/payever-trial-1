import { HistoryRecordEventListener } from './history-record-event.listener';
import { StatisticsEventListener } from './statistics-event.listener';
import { BeforeSantanderSeShippingGoodsEventListener } from './before-santander-se-shipping-goods-event.listener';
import { SendTransactionUpdateEventAfterActionListener } from './send-transaction-update-event-after-action.listener';
import { ValidateItemsBeforeActionListener } from './validate-items-before-action.listener';

export const EventListenersList: any[] = [
  HistoryRecordEventListener,
  StatisticsEventListener,
  BeforeSantanderSeShippingGoodsEventListener,
  SendTransactionUpdateEventAfterActionListener,
  ValidateItemsBeforeActionListener,
];
