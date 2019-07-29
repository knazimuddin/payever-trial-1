import { AvailableActionsAwareInterface } from '../awareness';
import { TransactionUnpackedDetailsInterface } from './index';

export interface TransactionWithAvailableActionsInterface
  extends
    TransactionUnpackedDetailsInterface,
    AvailableActionsAwareInterface {}
