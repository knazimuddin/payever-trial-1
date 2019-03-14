import { Document } from 'mongoose';
import { TransactionItemInterface } from '../interfaces';

export interface TransactionItemModel extends TransactionItemInterface, Document {}
