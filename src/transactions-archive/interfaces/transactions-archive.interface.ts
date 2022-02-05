import { TransactionPackedDetailsInterface } from '../../transactions/interfaces';

export interface TransactionsArchiveInterface extends TransactionPackedDetailsInterface {
  archiveEmail: string;
  businessId: string;
}
