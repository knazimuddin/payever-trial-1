import { TransactionRefundItemInterface } from './transaction-refund-item.interface';
import { TransactionUploadItemInterface } from './transaction-upload-item.interface';

export interface TransactionHistoryEntryInterface {
  action: string;
  amount: number;
  payment_status: string;
  created_at: Date;
  params?: { };
  reason?: string;
  is_restock_items?: boolean;
  upload_items?: TransactionUploadItemInterface[];
  refund_items?: TransactionRefundItemInterface[];
  mail_event?: {
    event_id: string,
    template_name: string,
  };
}
