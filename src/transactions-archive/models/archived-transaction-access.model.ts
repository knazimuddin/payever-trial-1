import { Document } from 'mongoose';

import { ArchivedTransactionAccessInterface } from '../interfaces';

export interface ArchivedTransactionAccessModel extends ArchivedTransactionAccessInterface, Document {
}
