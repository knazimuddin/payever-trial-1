import { Document } from 'mongoose';
import { TransactionRefundItemInterface } from '../interfaces';

export interface TransactionRefundItemModel extends TransactionRefundItemInterface, Document {}
