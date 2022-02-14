import { HistoryEventRefundItemInterface } from './history-event-refund-item.interface';
import { HistoryEventUploadItemInterface } from './history-event-upload-item.interface';
import { HistoryEventUserInterface } from './history-event-user.interface';

export interface HistoryEventDataInterface {
  amount: number;
  payment_status: string;
  reason?: string;
  params?: string;
  items_restocked?: boolean;
  refund_items?: HistoryEventRefundItemInterface[];
  saved_data?: HistoryEventUploadItemInterface[];
  mail_event?: {
    event_id: string;
    template_name: string;
  };
  user?: HistoryEventUserInterface;
  reference?: string;
}
