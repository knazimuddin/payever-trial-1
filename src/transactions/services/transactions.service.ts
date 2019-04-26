import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { InjectNotificationsEmitter, NotificationsEmitter } from '@pe/notifications-sdk';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { TransactionCartConverter, TransactionSantanderApplicationConverter } from '../converter';

import { RpcResultDto } from '../dto';
import { client } from '../es-temp/transactions-search';
import {
  CheckoutTransactionInterface,
  TransactionCartItemInterface,
  TransactionInterface,
  TransactionRpcUpdateInterface,
} from '../interfaces';
import { TransactionModel } from '../models';

@Injectable()
export class TransactionsService {

  constructor(
    @InjectModel('Transaction') private readonly transactionModel: Model<TransactionModel>,
    @InjectNotificationsEmitter() private readonly notificationsEmitter: NotificationsEmitter,
    private readonly logger: Logger,
  ) {}

  public async create(transactionDto: TransactionInterface): Promise<TransactionModel> {
    if (transactionDto.id) {
      transactionDto.original_id = transactionDto.id;
    }

    if (!transactionDto.uuid) {
      transactionDto.uuid = uuid();
    }

    try {
      const created: TransactionModel = await this.transactionModel.create(transactionDto);
      await this.bulkIndex('transactions', 'transaction', created.toObject());

      await this.notificationsEmitter.sendNotification(
        {
          kind: 'business',
          entity: transactionDto.business_uuid,
          app: 'transactions',
        },
        `notification.transactions.title.new_transaction`,
        {
          transactionId: transactionDto.uuid,
        },
      );

      return created;
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        this.logger.warn({ text: `Attempting to create existing Transaction with uuid '${transactionDto.uuid}'`});
      } else {
        throw err;
      }
    }
  }

  public async bulkIndex(index, type, item, operation = 'index') {
    const bulkBody = [];
    item.mongoId = item._id;
    delete item._id;
    bulkBody.push({
      [operation]: {
        _index: index,
        _type: type,
        _id: item.mongoId,
      },
    });

    if (operation === 'update') {
      bulkBody.push({doc: item});
    }
    else {
      bulkBody.push(item);
    }

    await client.bulk({ body: bulkBody })
      .then(response => {
        let errorCount = 0;
        for (const responseItem of response.items) {
          if (responseItem.index && responseItem.index.error) {
            console.log(++errorCount, responseItem.index.error);
          }
        }
      })
      .catch(console.log);
  }

  public async updateByUuid(
    transactionUuid: string,
    transactionDto: TransactionInterface,
  ): Promise<TransactionModel> {
    // a bit dirty, sorry
    // if (typeof (transaction.payment_details) !== 'string') {
    //   transaction.payment_details = JSON.stringify(transaction.payment_details);
    // }

    transactionDto.uuid = transactionUuid;

    const updated: TransactionModel = await this.transactionModel.findOneAndUpdate(
      { uuid: transactionUuid },
      transactionDto,
      {
        new: true,
        upsert: true,
      },
    );

    await this.bulkIndex('transactions', 'transaction', updated.toObject(), 'update');

    return updated;
  }

  public async findOneByUuid(transactionUuid: string): Promise<TransactionModel> {
    return this.findOneByParams({ uuid: transactionUuid });
  }

  public async findOneByParams(params): Promise<TransactionModel> {
    const transaction: TransactionModel = await this.transactionModel.findOne(params);

    if (!transaction) {
      return;
    }

    return this.prepareTransactionForOutput(transaction.toObject({ virtuals: true }));
  }

  public async findAll(businessId) {
    return this.transactionModel.find({business_uuid: businessId});
  }

  public async removeByUuid(transactionUuid: string): Promise<void> {
    await this.transactionModel.findOneAndRemove({ uuid: transactionUuid });
  }

  public async applyActionRpcResult(transaction: TransactionModel, result: RpcResultDto): Promise<void> {
    await this.applyPaymentProperties(transaction, result);
    await this.applyPaymentItems(transaction, result);
  }

  public async applyRpcResult(transaction: TransactionModel, result: RpcResultDto): Promise<void> {
    await this.applyPaymentProperties(transaction, result);
  }

  public async applyPaymentProperties(
    transaction: TransactionModel,
    result: RpcResultDto,
  ): Promise<void> {
    const paymentResult: CheckoutTransactionInterface = result.payment;
    const updating: TransactionRpcUpdateInterface = {};

    if (!paymentResult.amount || paymentResult.amount <= 0) {
      throw new RpcException(`Can not apply empty or negative amount for transaction #${transaction.id}`);
    }

    updating.amount = paymentResult.amount;
    updating.delivery_fee = paymentResult.delivery_fee;
    updating.status = paymentResult.status;
    updating.specific_status = paymentResult.specific_status;
    updating.place = result.workflow_state;

    if (paymentResult.payment_details) {
      TransactionSantanderApplicationConverter.setSantanderApplication(updating, result);
      updating.payment_details = JSON.stringify(result);
    }

    await this.transactionModel.updateOne(
      { uuid: transaction.uuid },
      {
        $set: updating,
      },
    );
  }

  public async applyPaymentItems(
    transaction: TransactionModel,
    result: RpcResultDto,
  ): Promise<void> {
    const items: TransactionCartItemInterface[] =
      TransactionCartConverter.fromCheckoutTransactionCart(result.payment_items, transaction.business_uuid);

    await this.transactionModel.updateOne(
      { uuid: transaction.uuid },
      {
        $set: {
          items,
        },
      },
    );
  }

  public prepareTransactionForOutput(transaction) {
    try {
      transaction.payment_details =
        transaction.payment_details
          ? JSON.parse(transaction.payment_details)
          : {}
        ;
    } catch (e) {
      this.logger.log(e);
      // just skipping payment_details
    }

    return transaction;
  }
}
