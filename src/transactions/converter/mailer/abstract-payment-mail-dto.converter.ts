import { TransactionCartItemInterface } from '../../interfaces/transaction';

export abstract class AbstractPaymentMailDtoConverter {
  protected static calculateTaxAmount(items: TransactionCartItemInterface[]): number {
    let taxAmount: number = 0;
    for (const item of items) {
      taxAmount += item.vat_rate;
    }

    return taxAmount;
  }
}
