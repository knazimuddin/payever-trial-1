import { PaymentBusinessDto } from './payment-business.dto';
import { PaymentItemDto } from './payment-item.dto';
import { PaymentDto } from './payment.dto';

export class PaymentMailDto {
  public to: string;
  public cc: string[] = [];
  public template_name: string;
  public business: PaymentBusinessDto;
  public payment: PaymentDto;
  public payment_items: PaymentItemDto[];
}
