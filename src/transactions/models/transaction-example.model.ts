import { Document, Types } from 'mongoose';
import { TransactionPackedDetailsInterface } from '../interfaces/transaction/example';
import { AddressModel } from './address.model';
import { TransactionCartItemModel } from './transaction-cart-item.model';
import { TransactionHistoryEntryModel } from './transaction-history-entry.model';

export interface TransactionExampleModel extends TransactionPackedDetailsInterface, Document {
  id: string;
  billing_address: AddressModel;
  history: Types.DocumentArray<TransactionHistoryEntryModel>;
  items: Types.DocumentArray<TransactionCartItemModel>;
  shipping_address: AddressModel;
}
