import { Document } from 'mongoose';
import { TransactionRefundItemInterface } from '../interfaces/transaction';

export interface TransactionRefundItemModel extends TransactionRefundItemInterface, Document {}
