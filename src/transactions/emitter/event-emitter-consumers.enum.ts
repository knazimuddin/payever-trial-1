import { HistoryRecordEmitterConsumer } from './history-record-emitter.consumer';
import { ShippingOrderEmitterConsumer, StatisticsEmitterConsumer } from './index';

export const EventEmitterConsumersEnum: any[] = [
  HistoryRecordEmitterConsumer,
  ShippingOrderEmitterConsumer,
  StatisticsEmitterConsumer,
];
