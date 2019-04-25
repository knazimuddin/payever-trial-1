import { HistoryEventMessageInterface } from './history-event-message.interface';

export interface HistoryEventActionCompletedInterface extends HistoryEventMessageInterface {
  action: string;
}
