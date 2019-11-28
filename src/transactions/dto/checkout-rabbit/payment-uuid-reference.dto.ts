import { IsString, IsNotEmpty } from 'class-validator';

export class PaymentUuidReferenceDto {
  @IsString()
  @IsNotEmpty()
  public uuid: string;
}
