import { Document, Types } from 'mongoose';
import { TransactionInterface } from '../interfaces';
import { AddressModel } from './address.model';
import { TransactionCartItemModel } from './transaction-cart-item.model';
import { TransactionHistoryEntryModel } from './transaction-history-entry.model';

export interface TransactionModel extends TransactionInterface, Document {
  id: string;
  billing_address: AddressModel;
  history: Types.DocumentArray<TransactionHistoryEntryModel>;
  items: Types.DocumentArray<TransactionCartItemModel>;
  shipping_address: AddressModel;
}
