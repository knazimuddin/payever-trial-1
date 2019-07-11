import { AddressInterface } from '../interfaces';
import { BusinessDto } from './business.dto';
import { TransactionDto } from './transaction.dto';

export class TransactionPaymentDto extends TransactionDto {
  public address?: AddressInterface;
  public business?: BusinessDto;
}
