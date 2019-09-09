import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { InjectNotificationsEmitter, NotificationsEmitter } from '@pe/notifications-sdk';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import {
  TransactionCartConverter,
  TransactionDoubleConverter,
  TransactionPaymentDetailsConverter,
  TransactionSantanderApplicationConverter,
} from '../converter';
import { RpcResultDto } from '../dto';
import { ElasticSearchClient } from '../elasticsearch/elastic-search.client';
import { ElasticTransactionEnum } from '../enum';
import { CheckoutTransactionInterface, CheckoutTransactionRpcUpdateInterface } from '../interfaces/checkout';
import {
  TransactionBasicInterface,
  TransactionCartItemInterface,
  TransactionHistoryEntryInterface,
  TransactionPackedDetailsInterface,
  TransactionUnpackedDetailsInterface,
} from '../interfaces/transaction';
import { TransactionHistoryEntryModel, TransactionModel } from '../models';
import { TransactionSchemaName } from '../schemas';

@Injectable()
export class TransactionsService {

  constructor(
    @InjectModel(TransactionSchemaName) private readonly transactionModel: Model<TransactionModel>,
    @InjectNotificationsEmitter() private readonly notificationsEmitter: NotificationsEmitter,
    private readonly elasticSearchClient: ElasticSearchClient,
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
      await this.elasticSearchClient.singleIndex(
        ElasticTransactionEnum.index,
        ElasticTransactionEnum.type,
        TransactionDoubleConverter.pack(created.toObject()),
      );

      await this.notificationsEmitter.sendNotification(
        {
          app: 'transactions',
          entity: transactionDto.business_uuid,
          kind: 'business',
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

  public async updateByUuid(
    transactionUuid: string,
    transactionDto: TransactionPackedDetailsInterface,
  ): Promise<TransactionModel> {
    if (transactionDto.id) {
      transactionDto.original_id = transactionDto.id;
    }
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

    await this.elasticSearchClient.singleIndex(
      ElasticTransactionEnum.index,
      ElasticTransactionEnum.type,
      TransactionDoubleConverter.pack(updated.toObject()),
    );

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

    await this.elasticSearchClient.singleIndex(
      ElasticTransactionEnum.index,
      ElasticTransactionEnum.type,
      TransactionDoubleConverter.pack(updated.toObject()),
    );

    return updated;
  }

  public async findModelByUuid(transactionUuid: string): Promise<TransactionModel> {
    return this.findModelByParams({ uuid: transactionUuid });
  }

  public async findModelByParams(params: any): Promise<TransactionModel> {
    return this.transactionModel.findOne(params);
  }

  public async findCollectionByParams(params: any): Promise<TransactionModel[]> {
    return this.transactionModel.find(params);
  }

  public async findUnpackedByUuid(transactionUuid: string): Promise<TransactionUnpackedDetailsInterface> {
    return this.findUnpackedByParams({ uuid: transactionUuid });
  }

  public async findUnpackedByParams(params: any): Promise<TransactionUnpackedDetailsInterface> {
    const transaction: TransactionModel = await this.transactionModel.findOne(params);

    if (!transaction) {
      return;
    }

    return TransactionPaymentDetailsConverter.convert(transaction.toObject({ virtuals: true }));
  }

  public async findAll(businessId: string): Promise<TransactionModel[]> {
    return this.transactionModel.find({business_uuid: businessId});
  }

  public async removeByUuid(transactionUuid: string): Promise<void> {
    await this.elasticSearchClient.deleteByQuery(
      ElasticTransactionEnum.index,
      ElasticTransactionEnum.type,
      {
        query: {
          match: {
            uuid: transactionUuid,
          },
        },
      },
    );

    await this.transactionModel.findOneAndRemove({ uuid: transactionUuid });
  }

  public async pushHistoryRecord(
    transaction: TransactionModel,
    history: TransactionHistoryEntryInterface,
  ): Promise<void> {
    const updated: TransactionModel = await this.transactionModel.findOneAndUpdate(
      { uuid: transaction.uuid },
      {
        $push: {
          history: history,
        },
      },
      {
        new: true,
      },
    );

    await this.elasticSearchClient.singleIndex(
      ElasticTransactionEnum.index,
      ElasticTransactionEnum.type,
      TransactionDoubleConverter.pack(updated.toObject()),
    );
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

  private async applyPaymentProperties(
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
      rpcResult: result,
      text: `Applied RPC result payment properties for transaction ${transaction.uuid}`,
      updateResult: updating,
    });

    const updated: TransactionModel = await this.transactionModel.findOneAndUpdate(
      {
        uuid: transaction.uuid,
      },
      {
        $set: updating,
      },
      {
        new: true,
      },
    );

    await this.elasticSearchClient.singleIndex(
      ElasticTransactionEnum.index,
      ElasticTransactionEnum.type,
      TransactionDoubleConverter.pack(updated.toObject()),
    );
  }

  private async applyPaymentItems(
    transaction: TransactionBasicInterface,
    result: RpcResultDto,
  ): Promise<void> {
    const items: TransactionCartItemInterface[] =
      TransactionCartConverter.fromCheckoutTransactionCart(result.payment_items, transaction.business_uuid);

    const updated: TransactionModel = await this.transactionModel.findOneAndUpdate(
      {
        uuid: transaction.uuid,
      },
      {
        $set: {
          items,
        },
      },
      {
        new: true,
      },
    );

    await this.elasticSearchClient.singleIndex(
      ElasticTransactionEnum.index,
      ElasticTransactionEnum.type,
      TransactionDoubleConverter.pack(updated.toObject()),
    );
  }
}
