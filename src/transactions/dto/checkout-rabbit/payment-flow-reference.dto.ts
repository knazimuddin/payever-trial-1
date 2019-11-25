import { IsString, IsNotEmpty } from 'class-validator'

export class PaymentFlowReferenceDto {
  @IsString()
  @IsNotEmpty()
  public id: string;
}

