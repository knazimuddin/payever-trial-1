import { HistoryRecordEmitterConsumer } from '../emitter/history-record-emitter.consumer';
import { ShippingOrderEmitterConsumer, StatisticsEmitterConsumer } from '../emitter';

export const EventEmiterConsumers: any[] = [
  HistoryRecordEmitterConsumer,
  ShippingOrderEmitterConsumer,
  StatisticsEmitterConsumer,
];
