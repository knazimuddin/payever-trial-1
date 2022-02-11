import { ValidateNested, IsDefined } from 'class-validator';
import { Type, Exclude, Expose } from 'class-transformer';
import { TransactionDto } from './transaction.dto';

@Exclude()
export class TransactionChangedDto {
  @Expose()
  @ValidateNested()
  @IsDefined()
  @Type(() => TransactionDto)
  public payment: TransactionDto;
}
