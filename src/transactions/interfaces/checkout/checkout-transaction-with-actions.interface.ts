import { CheckoutTransactionInterface } from '../checkout';
import { ActionItemInterface } from "../action-item.interface";

export interface CheckoutTransactionWithActionsInterface extends CheckoutTransactionInterface {
  actions: ActionItemInterface[]
}
