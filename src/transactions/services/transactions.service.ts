import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { InjectNotificationsEmitter, NotificationsEmitter } from '@pe/notifications-sdk';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import {
  TransactionCartConverter,
  TransactionPaymentDetailsConverter,
  TransactionSantanderApplicationConverter,
} from '../converter';
import { RpcResultDto } from '../dto';
import { client } from '../es-temp/transactions-search';
import { CheckoutTransactionInterface, CheckoutTransactionRpcUpdateInterface } from '../interfaces/checkout';
import {
  TransactionBasicInterface,
  TransactionCartItemInterface,
  TransactionPackedDetailsInterface,
  TransactionUnpackedDetailsInterface,
} from '../interfaces/transaction';
import { TransactionHistoryEntryModel, TransactionModel } from '../models';

@Injectable()
export class TransactionsService {

  constructor(
    @InjectModel('Transaction') private readonly transactionModel: Model<TransactionModel>,
    @InjectNotificationsEmitter() private readonly notificationsEmitter: NotificationsEmitter,
    private readonly logger: Logger,
  ) {}

  public async create(transactionDto: TransactionPackedDetailsInterface): Promise<TransactionModel> {
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
    transactionDto: TransactionPackedDetailsInterface,
  ): Promise<TransactionModel> {
    transactionDto.uuid = transactionUuid;

    const updated: TransactionModel = await this.transactionModel.findOneAndUpdate(
      {
        uuid: transactionUuid,
      },
      transactionDto,
      {
        new: true,
        upsert: true,
      },
    );

    await this.bulkIndex('transactions', 'transaction', updated.toObject(), 'update');

    return updated;
  }

  public async updateHistoryByUuid(
    transactionUuid: string,
    transactionHistory: TransactionHistoryEntryModel[],
  ): Promise<TransactionModel> {

    const updated: TransactionModel = await this.transactionModel.findOneAndUpdate(
      {
        uuid: transactionUuid,
      },
      {
        $set: {
          history: transactionHistory,
        },
      },
      {
        new: true,
      },
    );

    await this.bulkIndex('transactions', 'transaction', updated.toObject(), 'update');

    return updated;
  }

  public async findModelByUuid(transactionUuid: string): Promise<TransactionModel> {
    return this.findModelByParams({ uuid: transactionUuid });
  }

  public async findModelByParams(params): Promise<TransactionModel> {
    return this.transactionModel.findOne(params);
  }

  public async findUnpackedByUuid(transactionUuid: string): Promise<TransactionUnpackedDetailsInterface> {
    return this.findUnpackedByParams({ uuid: transactionUuid });
  }

  public async findUnpackedByParams(params): Promise<TransactionUnpackedDetailsInterface> {
    const transaction: TransactionModel = await this.transactionModel.findOne(params);

    if (!transaction) {
      return;
    }

    return TransactionPaymentDetailsConverter.convert(transaction.toObject({ virtuals: true }));
  }

  public async findAll(businessId) {
    return this.transactionModel.find({business_uuid: businessId});
  }

  public async removeByUuid(transactionUuid: string): Promise<void> {
    await this.transactionModel.findOneAndRemove({ uuid: transactionUuid });
  }

  public async applyActionRpcResult(
    transaction: TransactionUnpackedDetailsInterface,
    result: RpcResultDto,
  ): Promise<void> {
    await this.applyPaymentProperties(transaction, result);
    await this.applyPaymentItems(transaction, result);
  }

  public async applyRpcResult(
    transaction: TransactionUnpackedDetailsInterface,
    result: RpcResultDto,
  ): Promise<void> {
    await this.applyPaymentProperties(transaction, result);
  }

  public async applyPaymentProperties(
    transaction: TransactionUnpackedDetailsInterface,
    result: RpcResultDto,
  ): Promise<void> {
    const paymentResult: CheckoutTransactionInterface = result.payment;
    const updating: CheckoutTransactionRpcUpdateInterface = {};

    if (!paymentResult.amount || paymentResult.amount <= 0) {
      throw new RpcException(`Can not apply empty or negative amount for transaction #${transaction.id}`);
    }

    updating.amount = paymentResult.amount;
    updating.delivery_fee = paymentResult.delivery_fee;
    updating.status = paymentResult.status;
    updating.specific_status = paymentResult.specific_status;
    updating.reference = paymentResult.reference;
    updating.place = result.workflow_state;

    if (result.payment_details) {
      TransactionSantanderApplicationConverter.setSantanderApplication(updating, result);
      updating.payment_details = JSON.stringify(result.payment_details);
    }

    this.logger.log({
      text: `Applied RPC result payment properties for transaction ${transaction.uuid}`,
      rpcResult: result,
      updateResult: updating,
    });

    await this.transactionModel.updateOne(
      {
        uuid: transaction.uuid,
      },
      {
        $set: updating,
      },
    );
  }

  public async applyPaymentItems(
    transaction: TransactionBasicInterface,
    result: RpcResultDto,
  ): Promise<void> {
    const items: TransactionCartItemInterface[] =
      TransactionCartConverter.fromCheckoutTransactionCart(result.payment_items, transaction.business_uuid);

    await this.transactionModel.updateOne(
      {
        uuid: transaction.uuid,
      },
      {
        $set: {
          items,
        },
      },
    );
  }
}
