import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectNotificationsEmitter, NotificationsEmitter } from '@pe/notifications-sdk';
import { plainToClass } from 'class-transformer';

import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { TransactionCartItemDto } from '../dto/transaction-cart-item.dto';
import { TransactionDto } from '../dto/transaction.dto';
import {
  CheckoutTransactionCartItemInterface,
  CheckoutTransactionHistoryItemInterface,
  CheckoutTransactionInterface,
  TransactionCartItemInterface,
  TransactionHistoryEntryInterface,
  TransactionInterface,
  TransactionSantanderApplicationAwareInterface,
} from '../interfaces';
import { CheckoutPaymentDetailsAwareInterface } from '../interfaces/checkout-payment-details-aware.interface';
import { TransactionModel } from '../models';
import { ProductUuid } from '../tools/product-uuid';

@Injectable()
export class TransactionsService {

  constructor(
    @InjectModel('Transaction') private readonly transactionModel: Model<TransactionModel>,
    @InjectNotificationsEmitter() private notificationsEmitter: NotificationsEmitter,
  ) { }

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

  public async updateByUuid(
    transactionUuid: string,
    transaction: TransactionInterface,
  ): Promise<TransactionModel> {
    // a bit dirty, sorry
    if (typeof (transaction.payment_details) !== 'string') {
      transaction.payment_details = JSON.stringify(transaction.payment_details);
    }

    return this.transactionModel.findOneAndUpdate(
      { uuid: transactionUuid },
      transaction,
      { new: true },
    );
  }

  public async updateFromCheckoutTransactionByUuid(
    transactionUuid: string,
    checkoutTransaction: CheckoutTransactionInterface,
  ): Promise<TransactionModel> {
    const transaction: TransactionDto =
      plainToClass<TransactionInterface, CheckoutTransactionInterface>(
        TransactionDto,
        checkoutTransaction,
      );

    // a bit dirty, sorry
    if (typeof (checkoutTransaction.payment_details) !== 'string') {
      this.setSantanderApplication(transaction, checkoutTransaction);
      transaction.payment_details = JSON.stringify(transaction.payment_details);
    }

    return this.transactionModel.findOneAndUpdate(
      { uuid: transactionUuid },
      transaction,
      { new: true },
    );
  }

  public async updateHistoryByUuid(
    transactionUuid: string,
    historyType: string,
    data: CheckoutTransactionHistoryItemInterface,
  ): Promise<void> {
    const historyItem: TransactionHistoryEntryInterface =
      this.prepareTransactionHistoryItemForInsert(historyType, new Date(), data);

    await this.transactionModel.updateOne(
      { uuid: transactionUuid},
      {
        $push: {
          history: historyItem,
        },
      },
    );
  }

  public async findOneByUuid(transactionUuid: string): Promise<TransactionModel> {
    return this.findOneByParams({ uuid: transactionUuid });
  }

  public async findOneByParams(params): Promise<TransactionModel> {
    const transaction: TransactionModel = await this.transactionModel.findOne(params);

    if (!transaction) {
      throw new NotFoundException();
    }

    return this.prepareTransactionForOutput(transaction.toObject({ virtuals: true }));
  }

  public async findAll(businessId) {
    return this.transactionModel.find({business_uuid: businessId});
  }

  public async removeByUuid(transactionUuid: string): Promise<void> {
    await this.transactionModel.findOneAndRemove({ uuid: transactionUuid });
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

    if (checkoutTransaction.payment_details && typeof (checkoutTransaction.payment_details) !== 'string') {
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
      console.log(e);
      // just skipping payment_details
    }

    return transaction;
  }
}
