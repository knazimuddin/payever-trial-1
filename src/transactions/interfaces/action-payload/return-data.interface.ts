import { RefundItemInterface } from './refund-item.interface';

export interface ReturnDataInterface {
  amount: number;
  itemsRestocked: boolean;
  reason: string;
  refundItems: [RefundItemInterface];
  refundCollectedBySepa: boolean;
  refundGoodsReturned: boolean;
  refundInvoiceNumber: string;
}
