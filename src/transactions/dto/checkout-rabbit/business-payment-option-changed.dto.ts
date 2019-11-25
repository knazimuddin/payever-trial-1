import { ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessPaymentOptionDto } from './business-payment-option.dto';

export class BusinessPaymentOptionChangedDto {
  @ValidateNested()
  @IsDefined()
  @Type(() => BusinessPaymentOptionDto)
  public business_payment_option: BusinessPaymentOptionDto;
}
