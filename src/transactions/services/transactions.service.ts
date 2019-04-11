import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { InjectNotificationsEmitter, NotificationsEmitter } from '@pe/notifications-sdk';
import { plainToClass } from 'class-transformer';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { RpcResultDto, TransactionCartItemDto, TransactionDto } from '../dto';
import { client } from '../es-temp/transactions-search';
import {
  CheckoutPaymentDetailsAwareInterface,
  CheckoutTransactionCartItemInterface,
  CheckoutTransactionHistoryItemInterface,
  CheckoutTransactionInterface,
  TransactionCartItemInterface,
  TransactionHistoryEntryInterface,
  TransactionInterface,
  TransactionRpcUpdateInterface,
  TransactionSantanderApplicationAwareInterface,
} from '../interfaces';
import { TransactionModel } from '../models';
import { ProductUuid } from '../tools/product-uuid';

@Injectable()
export class TransactionsService {

  constructor(
    @InjectModel('Transaction') private readonly transactionModel: Model<TransactionModel>,
    @InjectNotificationsEmitter() private notificationsEmitter: NotificationsEmitter,
    private readonly logger: Logger,
  ) {}

  public async create(transactionDto: TransactionInterface): Promise<TransactionModel> {
    if (transactionDto.id) {
      transactionDto.original_id = transactionDto.id;
    }

    if (!transactionDto.uuid) {
      transactionDto.uuid = uuid();
    }

    this.notificationsEmitter.sendNotification(
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

    return this.transactionModel.create(transactionDto);
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

    bulkBody.push(item);

    await client.bulk({body: bulkBody})
      .then(response => {
        let errorCount = 0;
        response.items.forEach(responseItem => {
          if (responseItem.index && responseItem.index.error) {
            console.log(++errorCount, responseItem.index.error);
          }
        });
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

    const transaction = transactionDto;
    transaction.uuid = transactionUuid;
    await this.bulkIndex('transactions', 'transaction', transaction, 'update');

    return this.transactionModel.findOneAndUpdate(
      { uuid: transactionUuid },
      transactionDto,
      { new: true },
    );
  }

  // public async updateFromCheckoutTransactionByUuid(
  //   transactionUuid: string,
  //   checkoutTransaction: CheckoutTransactionInterface,
  // ): Promise<TransactionModel> {
  //   const transaction: TransactionDto =
  //     plainToClass<TransactionInterface, CheckoutTransactionInterface>(
  //       TransactionDto,
  //       checkoutTransaction,
  //     );
  //
  //   // a bit dirty, sorry
  //   // if (typeof (checkoutTransaction.payment_details) !== 'string') {
  //   this.setSantanderApplication(transaction, checkoutTransaction);
  //   transaction.payment_details = JSON.stringify(transaction.payment_details);
  //   // }
  //
  //   return this.transactionModel.findOneAndUpdate(
  //     { uuid: transactionUuid },
  //     transaction,
  //     { new: true },
  //   );
  // }

  public async updateHistoryByUuid(
    transactionUuid: string,
    historyType: string,
    data: CheckoutTransactionHistoryItemInterface,
  ): Promise<void> {
    const historyItem: TransactionHistoryEntryInterface =
      this.prepareTransactionHistoryItemForInsert(historyType, new Date(), data);

    await this.transactionModel.updateOne(
      { uuid: transactionUuid },
      {
        $push: {
          history: historyItem,
        },
      },
    );
  }

  // public async createOrUpdate(transaction: any) {
  //   if (transaction.uuid) {
  //     const existing = await this.transactionsModel.findOne({uuid: transaction.uuid});
  //     if (existing) {
  //       await this.bulkIndex('transactions', 'transaction', transaction, 'update');
  //
  //       return this.transactionsModel.findOneAndUpdate({uuid: transaction.uuid}, transaction);
  //     }
  //   }
  //
  //   transaction = this.create(transaction);
  //   await this.bulkIndex('transactions', 'transaction', transaction);
  //   return transaction;
  // }
  //
  // public async exists(uuid: string): Promise<boolean> {
  //   const transaction = await this.transactionsModel.findOne({uuid});
  //
  //   return !!transaction;
  // }

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
      this.setSantanderApplication(updating, result);
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
    const items = this.prepareTransactionCartForInsert(result.payment_items, transaction.business_uuid);

    await this.transactionModel.updateOne(
      { uuid: transaction.uuid },
      {
        $set: {
          items,
        },
      },
    );
  }

  public prepareTransactionForInsert(checkoutTransaction: CheckoutTransactionInterface): TransactionInterface {
    const transaction: TransactionDto =
      plainToClass<TransactionInterface, CheckoutTransactionInterface>(
        TransactionDto,
        checkoutTransaction,
      );

    if (checkoutTransaction.address) {
      transaction.billing_address = checkoutTransaction.address;
    }

    transaction.type = checkoutTransaction.type || checkoutTransaction.payment_type;

    if (checkoutTransaction.payment_details) {
      this.setSantanderApplication(transaction, checkoutTransaction);
      transaction.payment_details = JSON.stringify(transaction.payment_details);
    }

    if (checkoutTransaction.business) {
      transaction.business_uuid = checkoutTransaction.business.uuid;
      transaction.merchant_name = checkoutTransaction.business.company_name;
      transaction.merchant_email = checkoutTransaction.business.company_email;
    }

    if (checkoutTransaction.payment_flow) {
      transaction.payment_flow_id = checkoutTransaction.payment_flow.id;
    }

    if (checkoutTransaction.channel_set) {
      transaction.channel_set_uuid = checkoutTransaction.channel_set.uuid;
    }

    if (checkoutTransaction.history && checkoutTransaction.history.length) {
      for (const historyItem of checkoutTransaction.history) {
        transaction.history.push(
          this.prepareTransactionHistoryItemForInsert(
            historyItem.action,
            historyItem.created_at,
            historyItem,
          ),
        );
      }
    }

    return transaction;
  }

  public prepareTransactionHistoryItemForInsert(
    historyType: string,
    createdAt: Date,
    data: CheckoutTransactionHistoryItemInterface,
  ): TransactionHistoryEntryInterface {
    return {
      action: historyType,
      amount: data.data.amount,
      params: data.data.params,
      payment_status: data.data.payment_status,
      reason: data.data.reason,
      upload_items: data.data && data.data.saved_data,
      created_at: createdAt,
      is_restock_items: data.items_restocked
        ? data.items_restocked
        : null
      ,
    };
  }

  public prepareTransactionCartForInsert(
    cartItems: CheckoutTransactionCartItemInterface[],
    businessId: string,
  ): TransactionCartItemInterface[] {
    const newCart: TransactionCartItemInterface[] = [];

    for (const cartItem of cartItems) {
      const newCartItem: TransactionCartItemDto = {
        _id: cartItem.product_uuid
          ? cartItem.product_uuid
          : ProductUuid.generate(businessId, `${cartItem.name}${cartItem.product_variant_uuid}`)
        ,
        uuid: cartItem.product_uuid
          ? cartItem.product_uuid
          : null
        ,
        description: cartItem.description,
        fixed_shipping_price: cartItem.fixed_shipping_price,
        identifier: cartItem.identifier,
        item_type: cartItem.item_type,
        name: cartItem.name,
        price: cartItem.price,
        price_net: cartItem.price_net,
        product_variant_uuid: cartItem.product_variant_uuid,
        quantity: cartItem.quantity,
        shipping_price: cartItem.shipping_price,
        shipping_settings_rate: cartItem.shipping_settings_rate,
        shipping_settings_rate_type: cartItem.shipping_settings_rate_type,
        shipping_type: cartItem.shipping_type,
        thumbnail: cartItem.thumbnail,
        updated_at: cartItem.updated_at,
        url: cartItem.url,
        vat_rate: cartItem.vat_rate,
        weight: cartItem.weight,
        created_at: cartItem.created_at,
      };

      newCart.push(newCartItem);
    }

    return newCart;
  }

  private setSantanderApplication(
    transaction: TransactionSantanderApplicationAwareInterface,
    checkoutTransaction: CheckoutPaymentDetailsAwareInterface,
  ): void {
    transaction.santander_applications = [];

    if (checkoutTransaction.payment_details.finance_id) {
      transaction.santander_applications.push(checkoutTransaction.payment_details.finance_id);
    }

    if (checkoutTransaction.payment_details.application_no) {
      transaction.santander_applications.push(checkoutTransaction.payment_details.application_no);
    }

    if (checkoutTransaction.payment_details.application_number) {
      transaction.santander_applications.push(checkoutTransaction.payment_details.application_number);
    }
  }

  private prepareTransactionForOutput(transaction) {
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
