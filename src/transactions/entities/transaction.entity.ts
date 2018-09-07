import { Entity, Column, PrimaryGeneratedColumn, Table, OneToMany } from 'typeorm';
import { TransactionHistoryEntry } from './transaction-history-entry.entity';
import { TransactionItem } from './transaction-item.entity';

@Entity('payments')
export class Transaction {

  @PrimaryGeneratedColumn()
  id: string;

  /*** Relations ***/

  @OneToMany(type => TransactionHistoryEntry, history => history.transaction)
  history: TransactionHistoryEntry[];

  @OneToMany(type => TransactionItem, items => items.transaction)
  items: TransactionItem[];

  /*** Own columns ***/

  @Column()
  business_id: number;

  @Column()
  business_option_id: number;

  @Column()
  address_id: number;

  @Column()
  status: string;

  @Column({name: 'color_state'})
  status_color: string;

  @Column({name: 'merchant_fullname'})
  merchant_name: string;

  @Column({name: 'customer_fullname'})
  customer_name: string;

  @Column({name: 'payment_type'})
  type: string;

  @Column()
  workflow_place: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  @Column()
  credit_reference: string;

  @Column()
  amount: number;

  @Column()
  last_action: string;

  @Column()
  fee: number;

  @Column()
  other_fees: number;

  @Column()
  total: number;

  @Column()
  total_base_currency: number;

  @Column()
  currency: string;

  @Column()
  payever_commission: number;

  @Column()
  channel: string;

  @Column()
  channel_set_id: number;

  @Column()
  business_shipping_option_id: number;

  @Column()
  details: string;

  @Column()
  details_array: string;

  @Column()
  customer_email: string;

  @Column()
  specific_status: string;

  @Column()
  details_search_key: string;

  @Column()
  shipping_category: string;

  @Column()
  shipping_method_code: string;

  @Column()
  shipping_method_name: string;

  @Column()
  shipping_type: string;

  @Column()
  shipping_option_name: string;

  @Column()
  callback_trigger: string;

  @Column()
  uuid: string;

  @Column()
  shipping_address_id: number;

  @Column()
  delivery_fee: number;

  @Column()
  payment_fee: number;

  @Column()
  down_payment: number;

  @Column()
  payment_fee_accepted_by_merchant: number;

  @Column()
  prefilled: number;

}
