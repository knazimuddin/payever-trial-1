import { Document, Types } from 'mongoose';

import { ArchivedTransactionInterface } from '../interfaces';
import { AddressModel, TransactionCartItemModel, TransactionHistoryEntryModel } from '../../transactions/models';

export interface ArchivedTransactionModel extends ArchivedTransactionInterface, Document {
  id: string;
  billing_address: AddressModel;
  history: Types.DocumentArray<TransactionHistoryEntryModel>;

  captured_items?: Types.DocumentArray<TransactionCartItemModel>;
  items: Types.DocumentArray<TransactionCartItemModel>;
  refunded_items?: Types.DocumentArray<TransactionCartItemModel>;

  shipping_address: AddressModel;
}
