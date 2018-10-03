import { Entity, Column, PrimaryGeneratedColumn, Table, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from './transaction.entity';
import { TransactionRefundItem } from './transaction-refund-item.entity';

@Entity('payments__history')
export class TransactionHistoryEntry {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Transaction, transaction => transaction.history)
  @JoinColumn({name: 'payment_id'})
  transaction: Transaction;

  @OneToMany(type => TransactionRefundItem, refund_items => refund_items.history_entry)
  @JoinColumn({name: 'payment_history_id'})
  refund_items: TransactionRefundItem[];

  @Column()
  payment_id: string;

  @Column()
  action: string;

  @Column()
  payment_status: string;

  @Column()
  amount: number;

  @Column()
  params: string;

  @Column()
  created_at: string;

  @Column()
  is_restock_items: boolean;

  @Column()
  reason: string;

}
