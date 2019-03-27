import {
  AddressInterface,
  TransactionCartItemInterface,
  TransactionHistoryEntryInterface,
  TransactionInterface,
} from '../interfaces';

export class TransactionDto implements TransactionInterface {
  public id: string;
  public original_id: string; // id from mysql db
  public uuid: string;
  public action_running: boolean;
  public amount: number;
  public billing_address: AddressInterface;
  public business_option_id: number;
  public business_uuid: string;
  public channel: string; // 'store', ...
  public channel_uuid: string;
  public channel_set_uuid: string;
  public created_at: Date;
  public currency: string;
  public customer_email: string;
  public customer_name: string;
  public delivery_fee: number;
  public down_payment: number;
  public fee_accepted: boolean;
  public history: TransactionHistoryEntryInterface[];
  public items: TransactionCartItemInterface[];
  public merchant_email: string;
  public merchant_name: string;
  public payment_details: string; // Serialized big object
  public payment_fee: number;
  public payment_flow_id: string;
  public place: string;
  public reference: string;
  public santander_applications?: string[];
  public shipping_address: AddressInterface;
  public shipping_category: string;
  public shipping_method_name: string;
  public shipping_option_name: string;
  public specific_status: string;
  public status: string;
  public status_color: string;
  public store_id: string;
  public store_name: string;
  public total: number;
  public type: string;
  public updated_at: Date;
  public user_uuid: string;
}
