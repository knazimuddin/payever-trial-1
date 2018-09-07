import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, SelectQueryBuilder, WhereExpression } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { snakeCase } from 'lodash';

interface PaginationData {
  current: number;
  total: number; // sum of the transactoins amount
  totalCount: number; // number of records
}

@Injectable()
export class TransactionsListService {

  private outputColumnMap = {
    type: 'payment_type',
    business_name: 'merchant_fullname',
    customer_name: 'customer_fullname',
    merchant_name: 'merchant_fullname',
    status_color: 'color_state',
  };

  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async find(
    page: number = 1,
    limit: number = 100,
    filters = {},
    search: string = null,
    orderBy: string = null,
    direction: string = null,
  ): Promise<any> {

    const columns = [
      'payments.amount',
      'payments.channel',
      'payments.status_color',
      'payments.created_at',
      'payments.currency',
      'payments.customer_email',
      'payments.customer_name',
      'payments.id',
      'payments.type',
      'payments.specific_status',
      'payments.status',
      'payments.total',
      'payments.merchant_name',
    ];

    const query = this.transactionRepository
      .createQueryBuilder('payments')
      .select(columns)
      .andWhere(new Brackets(where => this.addSearchWhere(where, search)))
      .andWhere(new Brackets(where => this.addFiltersWhere(where, filters)))
      .orderBy(this.getInternalColumnName(orderBy), this.getDirection(direction))
      .limit(limit)
      .offset(limit * (page - 1))
    ;

    console.log(query.getQueryAndParameters());

    // const collection = this.format(await query.getMany());
    const collection = this.format(await query.getMany());

    console.log('collection', collection);

    const pagination_data: PaginationData = await this.getPaginationData(filters, search);
    pagination_data.current = page;

    return {
      collection,
      filter: {},
      pagination_data,
      usage: this.getUsage(),
    };
  }

  async findOne(id: string): Promise<any> {
    const query = this.transactionRepository
      .createQueryBuilder('payments')
      // .select(columns.map((column) => `payments.${column}`).join(', '))
      .select()
      // .from(Transaction, 'payments')
      // .from(Transaction, 'payments')
      .leftJoinAndSelect('payments.history', 'history')
      .leftJoinAndSelect('payments.items', 'items')
      .where('payments.id = :id', {id})
    ;

    console.log(query.getQueryAndParameters());

    const transaction = await query.getOne();

    // console.log('transaction details', transaction);

    // return transaction;
    return Object.assign({}, transaction,
      {
        actions: [{action: 'refund', label: 'Refund', enabled: true}],
        amount_refunded: 0,
        amount_rest: 0,
        available_refund_items: [],
        business_address: {
          city : 'Hamburg',
          country : 'DE',
          country_name : 'Germany',
          extra_phone : '+3803451',
          fax : '1234',
          id : 3,
          phone : '1235',
          street : 'Am Sandtorkai',
          type : 'business',
          uuid : 'dac6727a-c55e-11e7-8e31-525400000107',
          zip_code : '20457',
        },
        business_name: 'DEMO business_name',
        customer_address: {
          city : 'Hamburg',
          company_name : null,
          country : 'DE',
          country_name : 'Germany',
          discr : 'billing',
          fax : null,
          first_name : ';huoguiguiii',
          id : 3898947,
          last_name : 'uguigugu',
          mobile_phone : null,
          phone : null,
          salutation : 'SALUTATION_MR',
          social_security_number : null,
          street : 'Am Sandtorkai ',
          type : 'billing',
          uuid : 'd70ca653-dcb7-49b7-bc9d-380f75c70f1e',
          zip_code : '20457',
        },
        // fee_accepted: true, // ? payment_fee_accepted_by_merchant
        // merchant_email: 'demo@merchant.com',
        // payments_details: {},
        // reference: 'DEMO reference',
        // shipping_type: {name: 'Flat Rate Shipping', type: 'flat_rate'},
        // specific_status_translated: 'DEMO specific_status_translated',
        // status_translated: 'DEMO status_translated',
        // store: {id: '140877', name: 'DEMO 123'},
      },
    );
  }

  private async getPaginationData(filters, search): Promise<PaginationData> {
    return await this.transactionRepository
      .createQueryBuilder('payments')
      .andWhere(new Brackets(where => this.addSearchWhere(where, search)))
      .andWhere(new Brackets(where => this.addFiltersWhere(where, filters)))
      .select([
          'COUNT(payments.id) AS totalCount',
          'SUM(total) AS total',
        ].join(', '))
      .getRawOne()
    ;
  }

  private addSearchWhere(mainWhere: WhereExpression, search = null): void {
    if (!search) {
      mainWhere.where('1 = 1');
      return;
    }

    mainWhere.where(`id LIKE :search`, { search: `%${search}%` })
      .orWhere(`customer_fullname LIKE :search`, { search: `%${search}%` })
      .orWhere(`customer_email LIKE :search`, { search: `%${search}%` })
    ;
  }

  private addFiltersWhere(mainWhere: WhereExpression, filters): void {
    if (!filters || !Object.keys(filters).length) {
      mainWhere.where('1 = 1');
      return;
    }

    // { createdAt: { condition: 'isNotDate', value: '2018-08-29' } }

    Object.keys(filters).forEach((key) => {
      this.addFilterWhere(mainWhere, this.getInternalColumnName(key), filters[key]);
    });
  }

  private addFilterWhere(mainWhere: WhereExpression, column: string, filter: any) {
    const param = `${column}_filter`;
    const paramValue = {[param]: filter.value};

    // is|isNot|contains|doesNotContain|startsWith|endsWith|afterDate|beforeDate|isDate|isNotDate|betweenDates|greaterThan|lessThan|between|choice ",

    switch (filter.condition) {
      case 'is':
        if (Array.isArray(filter.value)) {
          mainWhere.andWhere(`${column} IN (:${param})`, paramValue);
        } else {
          mainWhere.andWhere(`${column} = :${param}`, paramValue);
        }
        break;
      case 'isNot':
        if (Array.isArray(filter.value)) {
          mainWhere.andWhere(`${column} NOT IN (:${param})`, paramValue);
        } else {
          mainWhere.andWhere(`${column} != :${param}`, paramValue);
        }
        break;
      case 'isDate':
        mainWhere.andWhere(`DATE(${column}) = :${param}`, paramValue);
        break;
      case 'isNotDate':
        mainWhere.andWhere(`DATE(${column}) != :${param}`, paramValue);
        break;
    }
  }

  private getUsage() {
    return {
      statuses: Object.keys(this.getStatusTranslations()).map((key) => ({key, name: this.getStatusTranslations()[key]})),
    };
  }

  private getInternalColumnName(column: string): string {
    const snakeCaseColumn: string = snakeCase(column);
    return this.outputColumnMap[snakeCaseColumn] || snakeCaseColumn;
  }

  private format(collection: any[]) {
      return collection
      .map((item) => ({
        ...item,
        status_translated: this.getStatusTranslations()[item.status],
      }))
    ;
  }

  private getDirection(direction: string): 'ASC'|'DESC' {
    return direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  }

  private getStatusTranslations() {
    return {
      STATUS_CANCELLED: 'Cancelled',
      STATUS_FAILED: 'Failed',
      STATUS_DECLINED: 'Declined',
      STATUS_IN_PROCESS: 'In progress',
      STATUS_PAID: 'Paid',
      STATUS_REFUNDED: 'Refunded',
      STATUS_ACCEPTED: 'Accepted',
      STATUS_NEW: 'New',
    };
  }

}
