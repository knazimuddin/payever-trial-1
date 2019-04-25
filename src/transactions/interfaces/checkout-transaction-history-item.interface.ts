export interface CheckoutTransactionHistoryItemInterface {
  action: string;
  payment_status: string;
  amount: number;
  params: string;
  created_at: Date;
  items_restocked: boolean;
  reason: string;
}
