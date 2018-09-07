import { Entity, Column, PrimaryGeneratedColumn, Table, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('payments__history')
export class TransactionHistoryEntry {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Transaction, transaction => transaction.history)
  @JoinColumn({ name: 'payment_id' })
  transaction: Transaction;

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
