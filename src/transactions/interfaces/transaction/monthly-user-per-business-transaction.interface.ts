export interface MonthlyUserPerBusinessTransactionInterface {
  _id: string;
  date: string;
  userId: string;
  businessId: string;
  currency: string;
  totalSpent: number;
}
