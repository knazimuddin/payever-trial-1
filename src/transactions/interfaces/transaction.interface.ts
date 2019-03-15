import { AddressInterface } from './address.interface';
import { TransactionHistoryEntryInterface } from './transaction-history-entry.interface';
import { TransactionItemInterface } from './transaction-item.interface';

export interface TransactionInterface {
  original_id: string; // id from mysql db
  uuid: string;
  action_running: boolean;
  amount: number;
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
  items: TransactionItemInterface[];
  merchant_email: string;
  merchant_name: string;
  payment_details: string; // Serialized big object
  payment_fee: number;
  payment_flow_id: string;
  place: string;
  reference: string;
  santander_applications: string[];
  shipping_address: AddressInterface[];
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
