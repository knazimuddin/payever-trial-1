import { AddressInterface } from '../../interfaces';
import { TransactionPaymentDetailsDto } from "../checkout-rabbit/transaction-payment-details.dto";

export class PaymentDto {
  public id: string;
  public uuid: string;
  public amount: number;
  public total: number;
  public currency: string;
  public reference: string;
  public delivery_fee: number;
  public customer_name: string;
  public customer_email: string;
  public created_at: string;
  public address: AddressInterface;
  public vat_rate: number;
  public payment_option: {
    payment_method: string;
    payment_details?: TransactionPaymentDetailsDto;
  };
}
