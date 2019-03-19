import { Document } from 'mongoose';
import { TransactionCartItemInterface } from '../interfaces';

export interface TransactionCartItemModel extends TransactionCartItemInterface, Document {}
