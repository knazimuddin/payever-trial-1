import { Injectable, Logger, HttpException, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { DelayRemoveClient, ElasticSearchClient } from '@pe/elastic-kit';
import { Mutex } from '@pe/nest-kit/modules/mutex';
import { InjectNotificationsEmitter, NotificationsEmitter } from '@pe/notifications-sdk';
import { Model, Types } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Observable } from 'rxjs';
import { FastifyRequest } from 'fastify';

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
import {
  PaymentFlowModel,
  TestTransactionModel,
  TransactionCartItemModel,
  TransactionHistoryEntryModel,
  TransactionModel,
} from '../models';
import { TransactionsNotifier } from '../notifiers';
import { AuthEventsProducer } from '../producer';
import { TestTransactionSchemaName, TransactionSchemaName } from '../schemas';
import { PaymentFlowService } from './payment-flow.service';

const TransactionMutexKey: string = 'transactions-transaction';

@Injectable()
export class TransactionsService implements NestInterceptor {
  public transactionModel: Model<TransactionModel>;

  constructor(
    @InjectModel(TransactionSchemaName) private readonly liveTransactionModel: Model<TransactionModel>,
    @InjectModel(TestTransactionSchemaName) private readonly testTransactionModel: Model<TestTransactionModel>,
    @InjectNotificationsEmitter() private readonly notificationsEmitter: NotificationsEmitter,
    private readonly paymentFlowService: PaymentFlowService,
    private readonly authEventsProducer: AuthEventsProducer,
    private readonly elasticSearchClient: ElasticSearchClient,
    private readonly notifier: TransactionsNotifier,
    private readonly delayRemoveClient: DelayRemoveClient,
    private readonly mutex: Mutex,
    private readonly logger: Logger,
  ) {
    this.transactionModel = liveTransactionModel;
  }

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.switchLiveMode();

    const request: FastifyRequest<any> = context.switchToHttp().getRequest<FastifyRequest<any>>();
    const testMode: boolean = request?.query?.test_mode === 'true';
    if (testMode) {
      this.switchTestMode();
    }

    return next.handle();
  }

  public async create(transactionDto: TransactionPackedDetailsInterface): Promise<TransactionModel> {
    if (transactionDto.id) {
      transactionDto.original_id = transactionDto.id;
    }

    if (!transactionDto.uuid) {
      transactionDto.uuid = uuid();
    }

    const created: TransactionModel = await this.mutex.lock(
      TransactionMutexKey,
      transactionDto.uuid,
      async () => this.transactionModel.create(transactionDto as TransactionModel),
    );

    await this.elasticSearchClient.singleIndex(
      ElasticTransactionEnum.index,
      TransactionDoubleConverter.pack(created.toObject()),
    );

    await this.notifier.sendNewTransactionNotification(created);
    const flow: PaymentFlowModel = await this.paymentFlowService.findOne({ id: created.payment_flow_id });
    if (flow && flow.seller_email) {
      await this.authEventsProducer.getSellerName({ email: flow.seller_email });
    }

    return created;
  }

  public async updateByUuid(
    transactionUuid: string,
    transactionDto: TransactionPackedDetailsInterface,
  ): Promise<TransactionModel> {
    const insertData: any = {
      uuid: transactionUuid,
    };
    if (transactionDto.id) {
      insertData.original_id = transactionDto.id;
    }

    delete transactionDto.id;
    delete transactionDto.original_id;
    delete transactionDto.uuid;

    const updated: TransactionModel = await this.mutex.lock(
      TransactionMutexKey,
      transactionDto.uuid,
      async () => this.transactionModel.findOneAndUpdate(
        {
          uuid: transactionUuid,
        },
        {
          $set: transactionDto as any,
          $setOnInsert: insertData,
        },
        {
          new: true,
          upsert: true,
        },
      ),
    );

    await this.elasticSearchClient.singleIndex(
      ElasticTransactionEnum.index,
      TransactionDoubleConverter.pack(updated.toObject()),
    );

    return updated;
  }

  public async updateHistoryByUuid(
    transactionUuid: string,
    transactionHistory: TransactionHistoryEntryModel[],
  ): Promise<TransactionModel> {
    const updated: TransactionModel = await this.mutex.lock(
      TransactionMutexKey,
      transactionUuid,
      async () => this.transactionModel.findOneAndUpdate(
        {
          uuid: transactionUuid,
        },
        {
          $set: {
            history: transactionHistory as any,
          },
        },
        {
          new: true,
        },
      ),
    );

    await this.elasticSearchClient.singleIndex(
      ElasticTransactionEnum.index,
      TransactionDoubleConverter.pack(updated.toObject()),
    );

    return updated;
  }

  public async findModelByUuid(transactionUuid: string): Promise<TransactionModel> {
    return this.findModelByParams({ uuid: transactionUuid });
  }

  public async findModelByParams(params: any): Promise<TransactionModel> {
    const transactionModel: TransactionModel[]
      = await this.transactionModel.find(params).sort({ created_at: -1 }).limit(1);
    if (!transactionModel || !transactionModel.length) {
      return null;
    }

    return transactionModel[0];
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
    return this.transactionModel.find({ business_uuid: businessId });
  }

  public async removeByUuid(transactionId: string): Promise<void> {
    const transaction: TransactionModel =
      await this.transactionModel.findOneAndRemove({ uuid: transactionId });
    if (!transaction) {
      return;
    }

    await this.delayRemoveClient.deleteByQuery(
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
    const updated: TransactionModel = await this.mutex.lock(
      TransactionMutexKey,
      transaction.uuid,
      async () => this.transactionModel.findOneAndUpdate(
        { uuid: transaction.uuid },
        {
          $push: {
            history: history as any,
          },
        },
        {
          new: true,
        },
      ),
    );

    await this.elasticSearchClient.singleIndex(
      ElasticTransactionEnum.index,
      TransactionDoubleConverter.pack(updated.toObject()),
    );
  }

  public async setShippingOrderProcessed(
    transactionId: string,
  ): Promise<TransactionModel> {
    return this.mutex.lock(
      TransactionMutexKey,
      transactionId,
      async () => this.transactionModel.findOneAndUpdate(
        { uuid: transactionId },
        {
          $set: {
            is_shipping_order_processed: true,
          },
        },
        {
          new: true,
        },
      ),
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

  public async saveCaptureItems(
    transaction: TransactionModel,
    captureItems: TransactionCartItemInterface[],
  ): Promise<void> {
    captureItems.forEach((captureItem: TransactionCartItemInterface) => {
      const existingCaptureItem: TransactionCartItemInterface =
        transaction.captured_items.find((transactionItem: TransactionCartItemInterface) => {
          return transactionItem.identifier === captureItem.identifier;
        });
      if (existingCaptureItem) {
        existingCaptureItem.quantity += captureItem.quantity;
      } else {
        transaction.captured_items.push(captureItem);
      }
    });

    transaction.markModified('captured_items');
    try {
      await transaction.save();
    }catch (e) {
      this.logger.log(
        {
          context: 'TransactionsService',
          error: e.message,
          message: `Error occurred during saveCaptureItems, transaction.original_id: ${transaction.original_id}`,
        },
      );
      throw new HttpException(`Couldn't store captured_items`, 412);
    }
  }

  public async saveRefundItems(
    transaction: TransactionModel,
    refundItems: TransactionCartItemInterface[],
  ): Promise<void> {
    refundItems.forEach((refundItem: TransactionCartItemInterface) => {
      const existingRefundItem: TransactionCartItemInterface =
        transaction.refunded_items.find((transactionItem: TransactionCartItemInterface) => {
          return transactionItem.identifier === refundItem.identifier;
        });
      if (existingRefundItem) {
        existingRefundItem.quantity += refundItem.quantity;
      } else {
        transaction.refunded_items.push(refundItem);
      }
    });

    transaction.markModified('refunded_items');
    await transaction.save();
  }

  public async updateTransactionByUuid(transactionUuid: string, updatedData: { }): Promise<void> {
    await this.transactionModel.findOneAndUpdate(
      {
        uuid: transactionUuid,
      },
      {
        $set: updatedData,
      },
      {
        new: true,
      },
    );
  }

  public switchTestMode(): void {
    this.transactionModel = this.testTransactionModel;
  }

  public switchLiveMode(): void {
    this.transactionModel = this.liveTransactionModel;
  }

  private async applyPaymentProperties(
    transaction: TransactionUnpackedDetailsInterface,
    result: RpcResultDto,
  ): Promise<void> {
    const paymentResult: CheckoutTransactionInterface = result.payment;
    const updating: CheckoutTransactionRpcUpdateInterface = { };

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


    const updated: TransactionModel = await this.mutex.lock(
      TransactionMutexKey,
      transaction.uuid,
      async () => this.transactionModel.findOneAndUpdate(
        {
          uuid: transaction.uuid,
        },
        {
          $set: updating,
        },
        {
          new: true,
        },
      ),
    );

    await this.elasticSearchClient.singleIndex(
      ElasticTransactionEnum.index,
      TransactionDoubleConverter.pack(updated.toObject()),
    );
  }

  private async applyPaymentItems(
    transaction: TransactionBasicInterface,
    result: RpcResultDto,
  ): Promise<void> {
    const items: Types.DocumentArray<TransactionCartItemModel> =
      TransactionCartConverter.fromCheckoutTransactionCart(result.payment_items, transaction.business_uuid);

    const updated: TransactionModel = await this.mutex.lock(
      TransactionMutexKey,
      transaction.uuid,
      async () => this.transactionModel.findOneAndUpdate(
        {
          uuid: transaction.uuid,
        },
        {
          $set: {
            items: items,
          },
        },
        {
          new: true,
        },
      ),
    );

    await this.elasticSearchClient.singleIndex(
      ElasticTransactionEnum.index,
      TransactionDoubleConverter.pack(updated.toObject()),
    );
  }
}
