import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectNotificationsEmitter, NotificationsEmitter } from '@pe/notifications-sdk';

import { Model } from 'mongoose';
import { v4 as uuidFactory } from 'uuid';
import { client } from '../es-temp/transactions-search';
import { ProductUuid } from '../tools/product-uuid';

@Injectable()
export class TransactionsService {

  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<any>,
    @InjectNotificationsEmitter() private notificationsEmitter: NotificationsEmitter,
    private readonly logger: Logger,
  ) {
  }

  public async create(transaction: any) {
    if (transaction.id) {
      transaction.original_id = transaction.id;
    }

    if (!transaction.uuid) {
      transaction.uuid = uuidFactory();
    }

    this.notificationsEmitter.sendNotification(
      {
        kind: 'business',
        entity: transaction.business_uuid,
        app: 'transactions',
      },
      `notification.transactions.title.new_transaction`,
      {
        transactionId: transaction.uuid,
      },
    );

    return this.transactionsModel.create(transaction);
  }

  public async bulkIndex(index, type, item) {
    let bulkBody = [];
    item.mongoId = item._id;
    delete item._id;
    bulkBody.push({
      index: {
        _index: index,
        _type: type,
        _id: item.mongoId,
      }
    });

    bulkBody.push(item);

    await client.bulk({body: bulkBody})
      .then(response => {
        let errorCount = 0;
        response.items.forEach(item => {
          if (item.index && item.index.error) {
            console.log(++errorCount, item.index.error);
          }
        });
      })
      .catch(console.log);
  };

  public async updateByUuid(uuid, data: any) {
    // a bit dirty, sorry
    if (typeof (data.payment_details) !== 'string') {
      this.setSantanderApplication(data);
      data.payment_details = JSON.stringify(data.payment_details);
    }
    const transaction = data;
    data.uuid = uuid;
    await this.bulkIndex('transactions', 'transaction', transaction);
    return this.transactionsModel.findOneAndUpdate({uuid}, data);
  }

  public async deleteAll() {
    return this.transactionsModel.collection.drop();
  }

  public async createOrUpdate(transaction: any) {
    if (transaction.uuid) {
      const existing = await this.transactionsModel.findOne({uuid: transaction.uuid});
      if (existing) {
        await this.bulkIndex('transactions', 'transaction', transaction);

        return this.transactionsModel.findOneAndUpdate({uuid: transaction.uuid}, transaction);
      }
    }

    return this.create(transaction);
  }

  public async exists(uuid: string): Promise<boolean> {
    const transaction = await this.transactionsModel.findOne({uuid});

    return !!transaction;
  }

  public async findOne(uuid: string) {
    return this.findOneByParams({uuid});
  }

  public async findAll(businessId) {
    return this.transactionsModel.find({business_uuid: businessId});
  }

  public async findOneByParams(params) {
    const transaction = await this.transactionsModel.findOne(params);

    if (!transaction) {
      throw new NotFoundException();
    }

    return this.prepareTransactionForOutput(transaction.toObject({virtuals: true}));
  }

  public async removeByUuid(uuid: string) {
    return this.transactionsModel.findOneAndRemove({uuid});
  }

  public prepareTransactionForInsert(transaction) {
    if (transaction.address) {
      transaction.billing_address = transaction.address;
    }

    transaction.type = transaction.type || transaction.payment_type;

    if (typeof (transaction.payment_details) !== 'string' && transaction.payment_details) {
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
      upload_items: data.data && data.data.saved_data,
      created_at: createdAt,
    };

    if (data.items_restocked) {
      result.is_restock_items = data.items_restocked;
    }

    return result;
  }

  public prepareTransactionCartForInsert(cartItems, businessId) {
    const newCart = [];

    for (const cartItem of cartItems) {
      if (cartItem.product_uuid) {
        cartItem._id = cartItem.product_uuid;
        cartItem.uuid = cartItem.product_uuid;
      } else {
        cartItem._id = ProductUuid.generate(businessId, `${ cartItem.name }${ cartItem.product_variant_uuid }`);
        cartItem.uuid = null;
      }
      newCart.push(cartItem);
    }

    return newCart;
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
      this.logger.log(e);
      // just skipping payment_details
    }

    return transaction;
  }
}
