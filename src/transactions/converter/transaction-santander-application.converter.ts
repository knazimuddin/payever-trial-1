import { Injectable } from '@nestjs/common';
import { CheckoutPaymentDetailsAwareInterface, TransactionSantanderApplicationAwareInterface } from '../interfaces';

@Injectable()
export class TransactionSantanderApplicationConverter {

  public static setSantanderApplication(
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
}
