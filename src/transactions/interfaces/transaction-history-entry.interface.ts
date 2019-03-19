import { TransactionRefundItemInterface } from './transaction-refund-item.interface';
import { TransactionUploadItemInterface } from './transaction-upload-item.interface';

export interface TransactionHistoryEntryInterface {
  action: string;
  amount: number;
  params: string;
  payment_status: string;
  reason: string;
  created_at: Date;
  is_restock_items?: boolean;
  upload_items?: TransactionUploadItemInterface[];
  refund_items?: TransactionRefundItemInterface[];
}
