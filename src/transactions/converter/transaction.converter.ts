import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { TransactionDto } from '../dto';
import { CheckoutTransactionInterface } from '../interfaces/checkout';
import { TransactionPackedDetailsInterface } from '../interfaces/transaction';
import { TransactionCartConverter } from './transaction-cart.converter';
import { TransactionSantanderApplicationConverter } from './transaction-santander-application.converter';

@Injectable()
export class TransactionConverter {

  public static fromCheckoutTransaction(
    checkoutTransaction: CheckoutTransactionInterface,
  ): TransactionPackedDetailsInterface {
    const transaction: TransactionPackedDetailsInterface =
      plainToClass<TransactionPackedDetailsInterface, CheckoutTransactionInterface>(
        TransactionDto,
        checkoutTransaction,
      );

    if (checkoutTransaction.address) {
      transaction.billing_address = checkoutTransaction.address;
    }

    transaction.type = checkoutTransaction.type || checkoutTransaction.payment_type;

    if (checkoutTransaction.payment_details) {
      TransactionSantanderApplicationConverter.setSantanderApplication(transaction, checkoutTransaction);
      transaction.payment_details = JSON.stringify(checkoutTransaction.payment_details);
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

    if (checkoutTransaction.items.length) {
      transaction.items = TransactionCartConverter.fromCheckoutTransactionCart(
        checkoutTransaction.items,
        transaction.business_uuid,
      );
    }

    /**
     * We do not update history with current operation.
     * History comes with another events and processing separately.
     */
    delete transaction.history;

    return transaction;
  }
}
