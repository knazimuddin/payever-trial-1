import { TransactionRefundItemInterface } from './transaction-refund-item.interface';
import { TransactionUploadItemInterface } from './transaction-upload-item.interface';

export interface TransactionHistoryEntryInterface {
  action: string;
  amount: number;
  created_at: Date;
  is_restock_items: boolean;
  params: string;
  payment_status: string;
  reason: string;
  upload_items: TransactionUploadItemInterface[];
  refund_items: TransactionRefundItemInterface[];
}
