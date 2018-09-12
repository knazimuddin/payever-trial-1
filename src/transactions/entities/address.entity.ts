import { Entity, Column, PrimaryGeneratedColumn, Table, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('addresses')
export class Address {

  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne(type => Transaction, transaction => transaction.shipping_address)
  // @JoinColumn({ name: 'payment_id' })
  // transaction: Transaction;

  @Column()
  social_security_number: string;

  @Column()
  salutation: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  // @Column()
  // created_at: string;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column()
  zip_code: string;

  @Column()
  street: string;

  // @Column()
  // discr: string;

  // @Column()
  // user_account_id: number;

  @Column()
  phone: string;

  @Column()
  mobile_phone: string;

  @Column()
  fax: string;

  // @Column()
  // related_address_id: number;

  @Column()
  company: string;

  @Column()
  email: string;

  // @Column()
  // uuid: string;

  // @Column()
  // updated_at: Date;

  // @Column()
  // deleted_at: Date;

}
