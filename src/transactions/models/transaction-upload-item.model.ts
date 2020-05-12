import { Document } from 'mongoose';
import { TransactionUploadItemInterface } from '../interfaces/transaction';

export interface TransactionUploadItemModel extends TransactionUploadItemInterface, Document { }
