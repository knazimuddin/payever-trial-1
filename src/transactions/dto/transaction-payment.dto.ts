import { PaymentStatusesEnum } from '../enum';
import { AddressInterface } from '../interfaces';
import { PaymentBusinessDto } from './mail';
import { TransactionDto } from './transaction.dto';

export class TransactionPaymentDto extends TransactionDto {
  public address?: AddressInterface;
  public business?: PaymentBusinessDto;
  public status: PaymentStatusesEnum;
  public payment_type: string;
}
