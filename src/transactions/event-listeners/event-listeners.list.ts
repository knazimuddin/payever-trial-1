import { HistoryRecordEventListener } from './history-record-event.listener';
import { StatisticsEventListener } from './statistics-event.listener';
import { BeforeSantanderSeShippingGoodsEventListener } from './before-santander-se-shipping-goods-event.listener';

export const EventListenersList: any[] = [
  HistoryRecordEventListener,
  StatisticsEventListener,
  BeforeSantanderSeShippingGoodsEventListener,
];
