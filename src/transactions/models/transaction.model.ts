import { Document } from 'mongoose';
import { TransactionInterface } from '../interfaces';
import { AddressModel } from './address.model';
import { TransactionHistoryEntryModel } from './transaction-history-entry.model';
import { TransactionItemModel } from './transaction-item.model';

export interface TransactionModel extends TransactionInterface, Document {
  billing_address: AddressModel;
  history: TransactionHistoryEntryModel[];
  items: TransactionItemModel[];
  shipping_address: AddressModel[];
}
