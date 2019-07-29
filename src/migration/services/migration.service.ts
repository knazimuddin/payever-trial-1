import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { omit } from 'lodash';
import { Repository } from 'typeorm';
import { Transaction } from '../entities';

@Injectable()
export class MigrationService {

  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
  ) {}

  public async find(): Promise<any> {
    const query = this.transactionRepository
      .createQueryBuilder('payments')
      .select()
      .leftJoinAndSelect('payments.payments_flow', 'payments_flow')
      .leftJoinAndSelect('payments.history', 'history')
      .leftJoinAndSelect('payments.items', 'items')
      .leftJoinAndSelect('payments.billing_address', 'billing_address')
      .leftJoinAndSelect('payments.shipping_address', 'shipping_address')
      .leftJoinAndSelect('payments.business', 'business')
      .leftJoinAndSelect('history.refund_items', 'refund_items')
    ;

    return this.format(await query.getMany());

  }

  private format(transactions: Transaction[]) {
    return transactions.map((transaction: Transaction) => {
      return {
        ...transaction,
        business_uuid: transaction.business ? transaction.business.uuid : null,
      };
    });
  }
}
