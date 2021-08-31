import { UnpackedDetailsAwareInterface } from '../awareness';
import { TransactionBasicInterface } from './transaction-basic.interface';

export interface TransactionUnpackedDetailsInterface
  extends TransactionBasicInterface, UnpackedDetailsAwareInterface {
    business_uuid: string;
}
