import { Document } from 'mongoose';
import { TransactionInterface } from '../interfaces';
import { AddressModel } from './address.model';
import { TransactionHistoryEntryModel } from './transaction-history-entry.model';
import { TransactionItemModel } from './transaction-item.model';

export interface TransactionModel extends TransactionInterface, Document {
  readonly billing_address: AddressModel;
  readonly history: TransactionHistoryEntryModel[];
  readonly items: TransactionItemModel[];
  readonly shipping_address: AddressModel[];
}
