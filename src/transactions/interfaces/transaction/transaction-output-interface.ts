import { ActionItemInterface } from '../action-item.interface';
import { AddressInterface } from '../address.interface';
import {
  TransactionCartItemInterface,
  TransactionHistoryEntryInterface,
  TransactionRefundItemInterface,
  UnpackedDetailsInterface,
} from './index';

export interface TransactionOutputInterface {
  actions: ActionItemInterface[];
  transaction: {
    id: string;
    original_id: string;
    uuid: string;
    currency: string;
    reference: string;
    amount: number;
    amount_refunded?: number;
    amount_rest?: number;
    total: number;
    created_at: Date;
    updated_at: Date;
  };
  details: UnpackedDetailsInterface;
  payment_option: {
    id: number;
    type: string;
    down_payment: number;
  };
  status: {
    general: string;
    specific: string;
    place: string;
    color: string;
  };
  billing_address: AddressInterface;
  channel_set: {
    uuid: string;
  };
  user: {
    uuid: string;
  };
  business: {
    uuid: string;
  };
  payment_flow: {
    id: string;
  };
  channel: {
    name: string; // 'store', ...
    uuid: string;
  };
  customer: {
    email: string;
    name: string;
  };
  history: TransactionHistoryEntryInterface[];
  cart: {
    items: TransactionCartItemInterface[];
    available_refund_items?: TransactionRefundItemInterface[];
  };
  merchant: {
    email: string;
    name: string;
  };
  fees: {
    payment_fee: number;
    delivery_fee: number;
    fee_accepted: boolean;
  };
  shipping: {
    address: AddressInterface;
    category: string;
    method_name: string;
    option_name: string;
  };
  store: {
    id: string;
    name: string;
  };
}
