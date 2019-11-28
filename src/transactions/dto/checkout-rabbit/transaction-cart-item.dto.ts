import { IsString, IsNumber, IsOptional, Allow } from 'class-validator';
import { CheckoutTransactionCartItemInterface } from '../../interfaces/checkout';
export class TransactionCartItemDto implements CheckoutTransactionCartItemInterface{
  @IsString()
  @IsOptional()
  public product_uuid?: string;
  @IsString()
  public uuid: string;
  @IsString()
  public description: string;
  @IsNumber()
  public fixed_shipping_price: number;
  @IsString()
  public identifier: string;
  @IsString()
  public item_type: string;
  @IsString()
  public name: string;
  @IsNumber()
  public price: number;
  @IsNumber()
  public price_net: number;
  @IsString()
  public product_variant_uuid: string;
  @IsNumber()
  public quantity: number;
  @IsNumber()
  public shipping_price: number;
  @IsNumber()
  public shipping_settings_rate: number;
  @IsString()
  public shipping_settings_rate_type: string;
  @IsString()
  public shipping_type: string;
  @IsString()
  public thumbnail: string;
  @IsString()
  public updated_at: Date;
  @IsString()
  public url: string;
  @IsNumber()
  public vat_rate: number;
  @IsNumber()
  public weight: number;
  @IsString()
  public created_at: Date;
  @Allow()
  public options?: any[];
}
