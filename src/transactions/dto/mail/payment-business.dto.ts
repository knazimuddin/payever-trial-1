import { IsNotEmpty, IsString } from 'class-validator';

export class PaymentBusinessDto {
  @IsNotEmpty()
  @IsString()
  public uuid: string;
}
