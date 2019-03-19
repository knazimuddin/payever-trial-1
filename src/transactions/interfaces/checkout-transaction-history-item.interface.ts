import { TransactionUploadItemInterface } from './transaction-upload-item.interface';

export interface CheckoutTransactionHistoryItemInterface {
  action: string;
  created_at: Date;
  items_restocked: boolean;
  data: {
    amount: number,
    payment_status: string,
    params: string,
    reason: string,
    saved_data: TransactionUploadItemInterface[],
  };
}
