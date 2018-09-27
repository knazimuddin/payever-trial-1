import { Entity, Column, PrimaryGeneratedColumn, Table, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from './transaction.entity';
import { TransactionHistoryEntry } from './transaction-history-entry.entity';

@Entity('payments_refund_items')
export class TransactionRefundItem {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => TransactionHistoryEntry, history => history.refund_items)
  @JoinColumn({name: 'payment_history_id'})
  history_entry: any;

  @Column()
  payment_history_id: number;

  @Column()
  payment_item_id: number;

  @Column()
  count: number;

}
