import { Injectable } from '@nestjs/common';
import { TransactionBasicInterface } from '../interfaces/transaction';

@Injectable()
export class TransactionDoubleConverter {

  public static pack(transaction: TransactionBasicInterface): TransactionBasicInterface {
    transaction.amount = Math.trunc(transaction.amount * 100);
    transaction.total = Math.trunc(transaction.total * 100);
    transaction.delivery_fee = transaction.delivery_fee
      ? Math.trunc(transaction.delivery_fee * 100)
      : transaction.delivery_fee
    ;
    transaction.down_payment = transaction.down_payment
      ? Math.trunc(transaction.down_payment * 100)
      : transaction.down_payment
    ;
    transaction.payment_fee = transaction.payment_fee
      ? Math.trunc(transaction.payment_fee * 100)
      : transaction.payment_fee
    ;

    for (const item of transaction.items) {
      item.price = item.price
        ? Math.trunc(item.price * 100)
        : item.price
      ;
      item.price_net = item.price_net
        ? Math.trunc(item.price_net * 100)
        : item.price_net
      ;
      item.vat_rate = item.vat_rate
        ? Math.trunc(item.vat_rate * 100)
        : item.vat_rate
      ;
      item.fixed_shipping_price = item.fixed_shipping_price
        ? Math.trunc(item.fixed_shipping_price * 100)
        : item.fixed_shipping_price
      ;
      item.shipping_price = item.shipping_price
        ? Math.trunc(item.shipping_price * 100)
        : item.shipping_price
      ;
      item.shipping_settings_rate = item.shipping_settings_rate
        ? Math.trunc(item.shipping_settings_rate * 100)
        : item.shipping_settings_rate
      ;
      item.weight = item.weight
        ? Math.trunc(item.weight * 100)
        : item.weight
      ;
    }

    for (const record of transaction.history) {
      record.amount = record.amount
        ? Math.trunc(record.amount * 100)
        : record.amount
      ;
    }

    return transaction;
  }

  public static unpack(transaction: TransactionBasicInterface): TransactionBasicInterface {
    transaction.amount = transaction.amount / 100;
    transaction.total = transaction.total / 100;
    transaction.delivery_fee = transaction.delivery_fee
      ? transaction.delivery_fee / 100
      : transaction.delivery_fee
    ;
    transaction.down_payment = transaction.down_payment
      ? transaction.down_payment / 100
      : transaction.down_payment
    ;
    transaction.payment_fee = transaction.payment_fee
      ? transaction.payment_fee / 100
      : transaction.payment_fee
    ;

    for (const item of transaction.items) {
      item.price = item.price
        ? item.price / 100
        : item.price
      ;
      item.price_net = item.price_net
        ? item.price_net / 100
        : item.price_net
      ;
      item.vat_rate = item.vat_rate
        ? item.vat_rate / 100
        : item.vat_rate
      ;
      item.fixed_shipping_price = item.fixed_shipping_price
        ? item.fixed_shipping_price / 100
        : item.fixed_shipping_price
      ;
      item.shipping_price = item.shipping_price
        ? item.shipping_price / 100
        : item.shipping_price
      ;
      item.shipping_settings_rate = item.shipping_settings_rate
        ? item.shipping_settings_rate / 100
        : item.shipping_settings_rate
      ;
      item.weight = item.weight
        ? item.weight / 100
        : item.weight
      ;
    }

    for (const record of transaction.history) {
      record.amount = record.amount
        ? record.amount / 100
        : record.amount
      ;
    }

    return transaction;
  }
}
