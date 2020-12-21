import { IsDateString, IsNumber, IsString } from 'class-validator';
import { TransactionExportAddressDto } from './transaction-export-address.dto';
import { TransactionExportBusinessDto } from './transaction-export-business.dto';
import { TransactionExportChannelSetDto } from './transaction-export-channel-set.dto';
import { TransactionExportItemDto } from './transaction-export-item.dto';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class TransactionExportDto {
  @IsString()
  @Expose({ name: 'original_id' })
  public id: string;

  @IsString()
  @Expose()
  public uuid: string;

  @IsString()
  @Expose()
  public api_call_id: string;

  @IsNumber()
  @Expose()
  public amount: number;

  @IsNumber()
  @Expose()
  public delivery_fee: number = 0;

  @IsNumber()
  @Expose()
  public down_payment: number = 0;

  @IsNumber()
  @Expose()
  public total: number;

  @Type(() => TransactionExportBusinessDto)
  @Expose()
  public business: TransactionExportBusinessDto;

  @IsNumber()
  @Expose({ name: 'business_option_id' })
  public businessPaymentOptionId: number;

  @IsString()
  @Expose()
  public channel: string;

  @Type(() => TransactionExportChannelSetDto)
  @Expose()
  public channel_set: TransactionExportChannelSetDto;

  @IsString()
  @Expose()
  public currency: string;

  @IsString()
  @Expose()
  public customer_email: string;

  @IsString()
  @Expose()
  public customer_name: string;

  @IsNumber()
  @Expose()
  public payment_fee: number = 0;

  @IsString()
  @Expose({ name: 'type' })
  public payment_type: string;

  @IsString()
  @Expose()
  public reference: string;

  @IsString()
  @Expose()
  public specific_status: string;

  @IsString()
  @Expose()
  public status: string;

  @Type(() => TransactionExportAddressDto)
  @Expose({ name: 'billing_address' })
  public address: TransactionExportAddressDto;

  @Type(() => TransactionExportAddressDto)
  @Expose()
  public shipping_address?: TransactionExportAddressDto;

  @Type(() => TransactionExportItemDto)
  @Expose()
  public items: TransactionExportItemDto[];

  @IsDateString()
  @Expose()
  public created_at: Date;

  @IsDateString()
  @Expose()
  public updated_at: Date;
}
