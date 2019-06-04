import { AddressInterface } from '../address.interface';
import { SantanderApplicationAwareInterface } from '../awareness';
import { TransactionCartItemInterface } from './transaction-cart-item.interface';
import { TransactionHistoryEntryInterface } from './transaction-history-entry.interface';
import { TransactionRefundItemInterface } from './transaction-refund-item.interface';

export interface TransactionBasicInterface extends SantanderApplicationAwareInterface {
  id: string;
  original_id: string; // id from mysql db
  uuid: string;
  action_running: boolean;
  amount: number;
  amount_refunded?: number;
  amount_rest?: number;
  available_refund_items?: TransactionRefundItemInterface[];
  billing_address: AddressInterface;
  business_option_id: number;
  business_uuid: string;
  channel: string; // 'store', ...
  channel_uuid: string;
  channel_set_uuid: string;
  created_at: Date;
  currency: string;
  customer_email: string;
  customer_name: string;
  delivery_fee: number;
  down_payment: number;
  fee_accepted: boolean;
  history: TransactionHistoryEntryInterface[];
  items: TransactionCartItemInterface[];
  merchant_email: string;
  merchant_name: string;
  payment_fee: number;
  payment_flow_id: string;
  place: string;
  reference: string;
  shipping_address: AddressInterface;
  shipping_category: string;
  shipping_method_name: string;
  shipping_option_name: string;
  specific_status: string;
  status: string;
  status_color: string;
  store_id: string;
  store_name: string;
  total: number;
  type: string;
  updated_at: Date;
  user_uuid: string;
}
