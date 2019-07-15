import { AddressInterface } from '../../interfaces';

export class PaymentDto {
  public id: string;
  public amount: number;
  public total: number;
  public currency: string;
  public reference: string;
  public customer_name: string;
  public customer_email: string;
  public created_at: Date;
  public address: AddressInterface;
  public vat_rate: number;
}
