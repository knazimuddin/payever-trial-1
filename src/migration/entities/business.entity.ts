import { Entity, Column, PrimaryGeneratedColumn, Table, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('businesses')
export class Business {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uuid: string;

  @Column()
  company_name: string;

}
