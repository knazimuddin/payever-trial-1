import { Entity, Column, PrimaryGeneratedColumn, Table, OneToOne, JoinColumn } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('payments__flow')
export class PaymentsFlow {

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  payment_id: string;

}
