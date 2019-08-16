import { IsNotEmpty, IsString } from 'class-validator';

export class BusinessCurrencyDto {
  @IsString()
  @IsNotEmpty()
  public _id: string;

  @IsString()
  @IsNotEmpty()
  public currency: string;
}
