import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { DelayRemoveClient, ElasticsearchClient } from '@pe/nest-kit';
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
import { ElasticTransactionEnum } from '../enum';
import { CheckoutTransactionInterface, CheckoutTransactionRpcUpdateInterface } from '../interfaces/checkout';
import {
  TransactionBasicInterface,
  TransactionCartItemInterface,
  TransactionHistoryEntryInterface,
  TransactionPackedDetailsInterface,
  TransactionUnpackedDetailsInterface,
} from '../interfaces/transaction';
import { PaymentFlowModel, TransactionHistoryEntryModel, TransactionModel } from '../models';
import { TransactionsNotifier } from '../notifiers';
import { TransactionSchemaName } from '../schemas';
import { AuthEventsProducer } from '../producer';
import { PaymentFlowService } from './payment-flow.service';

@Injectable()
export class TransactionsService {

  constructor(
    @InjectModel(TransactionSchemaName) private readonly transactionModel: Model<TransactionModel>,
    @InjectNotificationsEmitter() private readonly notificationsEmitter: NotificationsEmitter,
    private readonly paymentFlowService: PaymentFlowService,
    private readonly elasticSearchClient: ElasticsearchClient,
    private readonly logger: Logger,
    private readonly notifier: TransactionsNotifier,
    private readonly transactionEventsProducer: AuthEventsProducer,
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

      await this.notifier.sendNewTransactionNotification(created);
      const flow: PaymentFlowModel = await this.paymentFlowService.findOne({id: created.payment_flow_id});
      if (flow.seller_email) {
        await this.transactionEventsProducer.getSellerName({email: flow.seller_email});
      }

      return created;
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        this.logger.warn({
          data: transactionDto,
          text: `Attempting to create existing Transaction with uuid '${transactionDto.uuid}'`,
        });

        return this.transactionModel.findOne({ original_id: transactionDto.id });
      } else {
        throw err;
      }
    }
  }

  public async updateByUuid(
    transactionUuid: string,
    transactionDto: TransactionPackedDetailsInterface,
  ): Promise<TransactionModel> {
    try {
      const insertData: any = {
        uuid: transactionUuid,
      };
      if (transactionDto.id) {
        insertData.original_id = transactionDto.id;
      }

      delete transactionDto.id;
      delete transactionDto.original_id;
      delete transactionDto.uuid;

      const updated: TransactionModel = await this.transactionModel.findOneAndUpdate(
        {
          uuid: transactionUuid,
        },
        {
          $set: transactionDto,
          $setOnInsert: insertData,
        },
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
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        this.logger.warn({
          data: transactionDto,
          text: `Simultaneous update caused error, transaction uuid '${transactionDto.uuid}'`,
        });

        return this.transactionModel.findOne({ original_id: transactionDto.id });
      } else {
        throw err;
      }
    }
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

  public async removeByUuid(transactionId: string): Promise<void> {
    const transaction: TransactionModel = await this.transactionModel.findOneAndRemove({ uuid: transactionId });
    if (!transaction) {
      return;
    }

    const delayRemoveClient: DelayRemoveClient = new DelayRemoveClient(this.elasticSearchClient, this.logger);
    await delayRemoveClient.deleteByQuery(
      ElasticTransactionEnum.index,
      ElasticTransactionEnum.type,
      {
        query: {
          match_phrase: {
            uuid: transactionId,
          },
        },
      },
    );
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

  public async setShippingOrderProcessed(
    transactionId: string,
  ): Promise<TransactionModel> {
    return this.transactionModel.findOneAndUpdate(
      { uuid: transactionId },
      {
        $set: {
          is_shipping_order_processed: true,
        },
      },
      {
        new: true,
      },
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
