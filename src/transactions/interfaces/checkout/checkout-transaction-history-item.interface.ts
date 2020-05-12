import { TransactionRefundItemInterface, TransactionUploadItemInterface } from '../transaction';

export interface CheckoutTransactionHistoryItemInterface {
  action: string;
  payment_status: string;
  amount: number;
  params?: { };
  reason?: string;
  created_at: string;
  items_restocked?: boolean;
  is_restock_items?: boolean;
  upload_items?: TransactionUploadItemInterface[];
  refund_items?: TransactionRefundItemInterface[];
}
