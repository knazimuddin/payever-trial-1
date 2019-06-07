import { RefundItemInterface } from './refund-item.interface';

export interface ReturnDataInterface {
  amount: number;
  itemsRestocked: boolean;
  reason: boolean;
  refundItems: [RefundItemInterface];
  refundCollectedBySepa: boolean;
  refundGoodsReturned: boolean;
  refundInvoiceNumber: string;
}
