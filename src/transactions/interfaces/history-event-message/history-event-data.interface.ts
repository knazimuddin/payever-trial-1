import { HistoryEventRefundItemInterface } from './history-event-refund-item.interface';
import { HistoryEventUploadItemInterface } from './history-event-upload-item.interface';

export interface HistoryEventDataInterface {
  amount: number;
  payment_status: string;
  reason: string;
  params: string;
  items_restocked: boolean;
  refund_items: HistoryEventRefundItemInterface[];
  saved_data: HistoryEventUploadItemInterface[];
}
