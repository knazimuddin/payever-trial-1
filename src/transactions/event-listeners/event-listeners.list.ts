import { HistoryRecordEventListener } from './history-record-event.listener';
import { StatisticsEventListener } from './statistics-event.listener';
import { BeforeActionEventListener } from './before-action-event.listener';

export const EventListenersList: any[] = [
  HistoryRecordEventListener,
  StatisticsEventListener,
  BeforeActionEventListener,
];
