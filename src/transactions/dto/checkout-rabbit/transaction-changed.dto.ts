import { ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionDto } from './transaction.dto';

export class TransactionChangedDto {
  @ValidateNested()
  @IsDefined()
  @Type(() => TransactionDto)
  public payment: TransactionDto;
}
