import { Document } from 'mongoose';
import { TransactionCartItemInterface } from '../interfaces/transaction';

export interface TransactionCartItemModel extends TransactionCartItemInterface, Document {
  _id: string;
}
