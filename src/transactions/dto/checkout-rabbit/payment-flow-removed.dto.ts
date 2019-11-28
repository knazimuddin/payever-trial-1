import { ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentFlowReferenceDto } from './payment-flow-reference.dto';

export class PaymentFlowRemovedDto {
  @ValidateNested()
  @IsDefined()
  @Type(() => PaymentFlowReferenceDto)
  public flow: PaymentFlowReferenceDto;
}
