import { TransactionRefundItemInterface } from './transaction-refund-item.interface';
import { TransactionUploadItemInterface } from './transaction-upload-item.interface';

export interface TransactionHistoryEntryInterface {
  readonly action: string;
  readonly amount: number;
  readonly created_at: Date;
  readonly is_restock_items: boolean;
  readonly params: string;
  readonly payment_status: string;
  readonly reason: string;
  readonly upload_items: TransactionUploadItemInterface[];
  readonly refund_items: TransactionRefundItemInterface[];
}
