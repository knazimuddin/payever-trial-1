import { Document } from 'mongoose';
import { TransactionUploadItemInterface } from '../interfaces';

export interface TransactionUploadItemModel extends TransactionUploadItemInterface, Document {}
