import { ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentUuidReferenceDto } from './payment-uuid-reference.dto';

export class TransactionRemovedDto {
  @ValidateNested()
  @IsDefined()
  @Type(() => PaymentUuidReferenceDto)
  public payment: PaymentUuidReferenceDto;
}
