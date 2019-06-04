import { Injectable } from '@nestjs/common';
import { SantanderApplicationAwareInterface, UnpackedDetailsAwareInterface } from '../interfaces/awareness';

@Injectable()
export class TransactionSantanderApplicationConverter {

  public static setSantanderApplication(
    transaction: SantanderApplicationAwareInterface,
    checkoutTransaction: UnpackedDetailsAwareInterface,
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
