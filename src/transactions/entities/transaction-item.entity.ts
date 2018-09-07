import { Entity, Column, PrimaryGeneratedColumn, Table, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('payments__items')
export class TransactionItem {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Transaction, transaction => transaction.items)
  @JoinColumn({ name: 'payment_id' })
  transaction: Transaction;

  @Column()
  payment_id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  identifier: string;

  @Column()
  price: number;

  @Column()
  quantity: number;

  @Column()
  thumbnail: string;

  @Column()
  url: string;

  @Column()
  price_net: number;

  @Column()
  vat_rate: number;

  @Column()
  item_type: string;

  @Column()
  shipping_type: string;

  @Column()
  shipping_price: number;

  @Column()
  shipping_settings_rate_type: number;

  @Column()
  shipping_settings_rate: number;

  @Column()
  weight: number;

  @Column()
  product_variant_uuid: string;

  @Column()
  uuid: string;

  @Column()
  created_at: string;

  @Column()
  updated_at: string;

}
