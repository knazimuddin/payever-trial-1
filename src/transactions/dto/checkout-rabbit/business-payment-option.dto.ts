import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { BusinessPaymentOptionInterface } from '../../interfaces';

export class BusinessPaymentOptionDto implements BusinessPaymentOptionInterface {
  @IsNotEmpty()
  @IsNumber()
  public id: number;

  @IsNotEmpty()
  @IsString()
  public uuid: string;

  @IsNotEmpty()
  @IsNumber()
  public payment_option_id: number;

  @IsBoolean()
  public accept_fee: boolean;

  @IsString()
  @IsString()
  public status: string;

  @IsNumber()
  public fixed_fee: number;

  @IsNumber()
  public variable_fee: number;

  @IsOptional()
  public credentials: object;

  @IsOptional()
  public options: string;

  @IsBoolean()
  public completed: boolean;

  @IsBoolean()
  public shop_redirect_enabled: boolean;
}
