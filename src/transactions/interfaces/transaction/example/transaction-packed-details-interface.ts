import { PackedDetailsAwareInterface } from '../../awareness';
import { TransactionBasicInterface } from './transaction-basic.interface';

export interface TransactionPackedDetailsInterface extends TransactionBasicInterface, PackedDetailsAwareInterface {
}
