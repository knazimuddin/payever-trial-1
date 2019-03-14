import { AddressInterface } from './address.interface';
import { TransactionHistoryEntryInterface } from './transaction-history-entry.interface';
import { TransactionItemInterface } from './transaction-item.interface';

export interface TransactionInterface {
  readonly original_id: string; // id from mysql db
  readonly uuid: string;
  readonly action_running: boolean;
  readonly amount: number;
  readonly billing_address: AddressInterface;
  readonly business_option_id: number;
  readonly business_uuid: string;
  readonly channel: string; // 'store', ...
  readonly channel_uuid: string;
  readonly channel_set_uuid: string;
  readonly created_at: Date;
  readonly currency: string;
  readonly customer_email: string;
  readonly customer_name: string;
  readonly delivery_fee: number;
  readonly down_payment: number;
  readonly fee_accepted: boolean;
  readonly history: TransactionHistoryEntryInterface[];
  readonly items: TransactionItemInterface[];
  readonly merchant_email: string;
  readonly merchant_name: string;
  readonly payment_details: string; // Serialized big object
  readonly payment_fee: number;
  readonly payment_flow_id: string;
  readonly place: string;
  readonly reference: string;
  readonly santander_applications: string[];
  readonly shipping_address: AddressInterface[];
  readonly shipping_category: string;
  readonly shipping_method_name: string;
  readonly shipping_option_name: string;
  readonly specific_status: string;
  readonly status: string;
  readonly status_color: string;
  readonly store_id: string;
  readonly store_name: string;
  readonly total: number;
  readonly type: string;
  readonly updated_at: Date;
  readonly user_uuid: string;
}
