import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, SelectQueryBuilder, WhereExpression } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { omit } from 'lodash';

@Injectable()
export class MigrationService {

  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async find(): Promise<any> {
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
