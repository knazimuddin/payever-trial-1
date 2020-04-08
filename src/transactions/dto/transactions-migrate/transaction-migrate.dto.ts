import { IsDateString, IsNumber, IsString } from 'class-validator';
import { TransactionMigrateAddressDto } from './transaction-migrate-address.dto';
import { TransactionMigrateBusinessDto } from './transaction-migrate-business.dto';
import { TransactionMigrateChannelSetDto } from './transaction-migrate-channel-set.dto';
import { TransactionMigrateItemDto } from './transaction-migrate-item.dto';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class TransactionMigrateDto {
  @IsString()
  @Expose({ name: 'original_id' })
  public id: string;

  @IsString()
  @Expose()
  public uuid: string;

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

  @Type(() => TransactionMigrateBusinessDto)
  @Expose()
  public business: TransactionMigrateBusinessDto;

  @IsString()
  @Expose()
  public channel: string;

  @Type(() => TransactionMigrateChannelSetDto)
  @Expose()
  public channel_set: TransactionMigrateChannelSetDto;

  @IsString()
  @Expose()
  public currency: string;

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

  @Type(() => TransactionMigrateAddressDto)
  @Expose({ name: 'billing_address' })
  public address: TransactionMigrateAddressDto;

  @Type(() => TransactionMigrateAddressDto)
  @Expose()
  public shipping_address?: TransactionMigrateAddressDto;

  @Type(() => TransactionMigrateItemDto)
  @Expose()
  public items: TransactionMigrateItemDto[];

  @IsDateString()
  @Expose()
  public created_at: Date;

  @IsDateString()
  @Expose()
  public updated_at: Date;
}
