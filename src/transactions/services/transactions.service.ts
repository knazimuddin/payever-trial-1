import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidFactory } from 'uuid';

@Injectable()
export class TransactionsService {

  constructor(
    @InjectModel('TransactionsSchema') private readonly transactionsModel: Model<any>,
  ) { }

  public async create(transaction: any) {
    if (!transaction.uuid) {
      transaction.uuid = uuidFactory();
    }

    return this.transactionsModel.create(transaction);
  }

  public async updateByUuid(uuid, data: any) {
    // a bit dirty, sorry
    if (typeof (data.payment_details) !== 'string') {
      this.setSantanderApplication(data);
      data.payment_details = JSON.stringify(data.payment_details);
    }

    return this.transactionsModel.findOneAndUpdate({ uuid }, data);
  }

  public async deleteAll() {
    return this.transactionsModel.collection.drop();
  }

  public async createOrUpdate(transaction: any) {
    if (transaction.uuid) {
      const existing = await this.transactionsModel.findOne({ uuid: transaction.uuid });
      if (existing) {
        return this.transactionsModel.findOneAndUpdate({ uuid: transaction.uuid }, transaction);
      }
    }

    return this.create(transaction);
  }

  public async findOne(uuid: string) {
    return this.findOneByParams({ uuid });
  }

  public async findOneByParams(params) {
    const transaction = await this.transactionsModel.findOne(params);

    return transaction
      ? this.prepareTransactionForOutput(transaction.toObject({ virtuals: true }))
      : null
      ;
  }

  public async removeByUuid(uuid: string) {
    return this.transactionsModel.findOneAndRemove({ uuid });
  }

  public prepareTransactionForInsert(transaction) {
    if (transaction.address) {
      transaction.billing_address = transaction.address;
    }

    transaction.type = transaction.type || transaction.payment_type;

    if (transaction.payment_details) {
      this.setSantanderApplication(transaction);
      transaction.payment_details = JSON.stringify(transaction.payment_details);
    }

    if (transaction.business) {
      transaction.business_uuid = transaction.business.uuid;
      transaction.merchant_name = transaction.business.company_name;
      transaction.merchant_email = transaction.business.company_email;
    }

    if (transaction.payment_flow) {
      transaction.payment_flow_id = transaction.payment_flow.id;
    }

    if (transaction.channel_set) {
      transaction.channel_set_uuid = transaction.channel_set.uuid;
    }

    if (transaction.history && transaction.history.length) {
      transaction.history.map((historyItem) => {
        return this.prepareTransactionHistoryItemForInsert(historyItem.action, historyItem.created_at, historyItem);
      });
    }
  }

  public prepareTransactionHistoryItemForInsert(historyType, createdAt, data) {
    const result: any = {
      ...data.data,
      action: historyType,
      upload_items: data && data.data.saved_data,
      created_at: createdAt,
    };

    if (data.items_restocked) {
      result.is_restock_items = data.items_restocked;
    }

    return result;
  }

  private setSantanderApplication(transaction: any): void {
    transaction.santander_applications = [];

    if (transaction.payment_details.finance_id) {
      transaction.santander_applications.push(transaction.payment_details.finance_id);
    }

    if (transaction.payment_details.application_no) {
      transaction.santander_applications.push(transaction.payment_details.application_no);
    }

    if (transaction.payment_details.application_number) {
      transaction.santander_applications.push(transaction.payment_details.application_number);
    }
  }

  private prepareTransactionForOutput(transaction) {
    try {
      transaction.payment_details = transaction.payment_details ? JSON.parse(transaction.payment_details) : {};
    } catch (e) {
      // just skipping payment_details
    }

    return transaction;
  }
}
