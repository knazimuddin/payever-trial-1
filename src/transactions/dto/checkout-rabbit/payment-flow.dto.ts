import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class PaymentFlowDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsNumber()
  public amount: number;

  @IsNumber()
  public shipping_fee: number;

  @IsString()
  @IsOptional()
  public shipping_method_code?: string;

  @IsString()
  @IsOptional()
  public shipping_method_name?: string;

  @IsNumber()
  public tax_value: number;

  @IsString()
  @IsOptional()
  public currency?: string;

  @IsString()
  @IsOptional()
  public reference?: string;

  @IsString()
  @IsOptional()
  public salutation?: string;

  @IsString()
  @IsOptional()
  public first_name?: string;

  @IsString()
  @IsOptional()
  public last_name?: string;

  @IsString()
  @IsOptional()
  public country?: string;

  @IsString()
  @IsOptional()
  public city?: string;

  @IsString()
  @IsOptional()
  public zip_code?: string;

  @IsString()
  @IsOptional()
  public street?: string;

  @IsString()
  @IsOptional()
  public channel_set_uuid?: string;

  @IsString()
  @IsNotEmpty()
  public step: string;

  @IsString()
  @IsOptional()
  public state?: string;

  @IsOptional()
  @IsString()
  public origin?: string;

  @IsOptional()
  @IsBoolean()
  public express?: boolean;

  @IsOptional()
  @IsString()
  public callback?: string;

  @IsOptional()
  @IsString()
  public x_frame_host?: string;
}
