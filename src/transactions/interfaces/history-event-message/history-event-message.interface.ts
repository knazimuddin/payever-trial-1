import { HistoryEventDataInterface } from './history-event-data.interface';

export interface HistoryEventMessageInterface {
  payment: {
    id: string,
    uuid: string,
  };
  data: HistoryEventDataInterface;
}
