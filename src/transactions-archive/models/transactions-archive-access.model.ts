import { Document } from 'mongoose';

import { TransactionsArchiveAccessInterface } from '../interfaces';

export interface TransactionsArchiveAccessModel extends TransactionsArchiveAccessInterface, Document {
}
