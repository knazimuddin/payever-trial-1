import { Injectable } from "@nestjs/common";
import { AbstractMessageMock, PactRabbitMqMessageProvider } from "@pe/pact-kit";
import { TransactionPackedDetailsInterface, TransactionCartItemInterface } from '../../../src/transactions/interfaces';
import { TransactionModel, TransactionHistoryEntryModel, TransactionCartItemModel, AddressModel } from '../../../src/transactions/models';
import * as uuid from 'uuid';
import { Types } from "mongoose";
import { RabbitRoutingKeys } from '../../../src/enums';
import { TransactionEventProducer } from '../../../src/transactions/producer';
import { HistoryEventActionCompletedInterface, HistoryEventDataInterface } from "../../../src/transactions/interfaces/history-event-message";
import { TransactionPaymentInterface } from '../../../src/transactions/interfaces/transaction/transaction-payment.interface';

@Injectable()
export class StatisticsMessagesMock extends AbstractMessageMock {
  private existing: TransactionModel = {
    _id: uuid.v4(),
    billing_address: {} as any,
    businessId: uuid.v4(),
    channel_set_uuid: uuid.v4(),
    updated_at: new Date(),
    amount: 123,
    history: [{} as TransactionHistoryEntryModel] as Types.DocumentArray<TransactionHistoryEntryModel>,
    id: uuid.v4(),
    items: [
      {
        _id: uuid.v4(),
        uuid: uuid.v4(),
        description: 'some description',
        fixed_shipping_price: 1,
        identifier: 'some identifier',
        item_type: 'clothing',
        name: 'Jacket',
        price: 123,
        price_net: 111,
        product_variant_uuid: uuid.v4(),
        quantity: 2,
        shipping_price: 3.99,
        shipping_settings_rate: 0.99,
        shipping_settings_rate_type: 'type 2',
        shipping_type: 'shipping_type 1',
        thumbnail: 'shipping thumbnail',
        updated_at: new Date(),
        url: 'https://someshop.com/someproducts/',
        vat_rate: 13,
        weight: 0.550,
        created_at: new Date(),
      } as TransactionCartItemInterface,
    ] as Types.DocumentArray<TransactionCartItemModel>,
    shipping_address: {} as AddressModel,
    uuid: uuid.v4(),
  } as TransactionModel;

  private updating: TransactionPackedDetailsInterface = {
    amount: 122,
    updated_at: new Date(),
  } as TransactionPackedDetailsInterface;

  private refund: HistoryEventActionCompletedInterface = {
    action: 'some action',
    payment: {
      id: uuid.v4(),
      uuid: uuid.v4(),
    },
    data: {
      amount: 123.0,
    } as HistoryEventDataInterface,
  }

  @PactRabbitMqMessageProvider(RabbitRoutingKeys.TransactionsPaymentAdd)
  public async mockProduceTransactionPaymentAddEvent(): Promise<void> {
    const producer: TransactionEventProducer =
      await this.getProvider<TransactionEventProducer>(TransactionEventProducer)

    await producer.produceTransactionAddEvent(this.existing, this.updating.amount);
  }

  @PactRabbitMqMessageProvider(RabbitRoutingKeys.TransactionsPaymentSubtract)
  public async mockProduceRefunedTransaction(): Promise<void> {
    const producer: TransactionEventProducer =
      await this.getProvider<TransactionEventProducer>(TransactionEventProducer);

    await producer.produceTransactionSubtractEvent(this.existing, this.refund)
  }

  @PactRabbitMqMessageProvider(RabbitRoutingKeys.TransactionsPaymentRemoved)
  public async mockProduceTrasactionRemoveEvent(): Promise<void> {
    const producer: TransactionEventProducer =
      await this.getProvider<TransactionEventProducer>(TransactionEventProducer);
    await producer.produceTransactionRemoveEvent(this.existing);
  }

}
