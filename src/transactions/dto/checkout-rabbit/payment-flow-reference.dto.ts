import { IsNotEmpty, IsString } from 'class-validator';

export class PaymentFlowReferenceDto {
  @IsString()
  @IsNotEmpty()
  public id: string;
}

