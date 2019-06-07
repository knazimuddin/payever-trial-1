import { HistoryEventMessageInterface } from './history-event-message.interface';

export interface HistoryEventAddHistoryInterface extends HistoryEventMessageInterface {
  history_type: string;
}
