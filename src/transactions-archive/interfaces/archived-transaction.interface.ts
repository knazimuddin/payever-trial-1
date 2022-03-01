import { TransactionPackedDetailsInterface } from '../../transactions/interfaces';

export interface ArchivedTransactionInterface extends TransactionPackedDetailsInterface {
  archiveEmail: string;
  businessId: string;
}
