import { Document } from 'mongoose';
import { TransactionHistoryEntryInterface } from '../interfaces';
import { TransactionRefundItemModel } from './transaction-refund-item.model';
import { TransactionUploadItemModel } from './transaction-upload-item.model';

export interface TransactionHistoryEntryModel extends TransactionHistoryEntryInterface, Document {
  upload_items: TransactionUploadItemModel[];
  refund_items: TransactionRefundItemModel[];
}
