import { IsString, IsNumber, IsDateString, IsArray } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TransactionMigrateItemDto {
  @IsDateString()
  @Expose()
  public created_at: Date;

  @IsArray()
  @Expose()
  public extra_data?: any[];

  @IsString()
  @Expose()
  public identifier?: string;

  @IsString()
  @Expose()
  public name: string;

  @IsArray()
  @Expose()
  public options?: any[];

  @IsNumber()
  @Expose()
  public price: number;

  @IsNumber()
  @Expose()
  public price_net?: number;

  @IsString()
  @Expose()
  public product_uuid?: string;

  @IsNumber()
  @Expose()
  public quantity: number;

  @IsString()
  @Expose()
  public sku?: string;

  @IsDateString()
  @Expose()
  public updated_at: Date;

  @IsString()
  @Expose()
  public uuid: string;

  @IsNumber()
  @Expose()
  public vat_rate?: number;
}
