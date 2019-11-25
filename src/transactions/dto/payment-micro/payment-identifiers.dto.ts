import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class PaymentIdentifiersDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsString()
  @IsOptional()
  public uuid?: string;
}
