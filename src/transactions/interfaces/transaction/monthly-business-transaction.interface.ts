export interface MonthlyBusinessTransactionInterface {
  _id: string;
  amount: number;
  date: string;
  refund: number;
  transactions: Array<{
    id: string;
    currency: string;
  }>;
}
