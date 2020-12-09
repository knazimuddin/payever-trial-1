import { TransactionUnpackedDetailsInterface } from './transaction';
import { ActionItemInterface } from './action-item.interface';
import { ActionPayloadInterface } from './action-payload';

export interface ActionCallerInterface {
  getActionsList(
    transaction: TransactionUnpackedDetailsInterface,
  ): Promise<ActionItemInterface[]>;

  runAction(
    transaction: TransactionUnpackedDetailsInterface,
    action: string,
    actionPayload: ActionPayloadInterface,
  ): Promise<void>;

  updateStatus(
    transaction: TransactionUnpackedDetailsInterface,
  ): Promise<void>;
}
