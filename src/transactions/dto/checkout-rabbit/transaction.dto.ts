import { Type, Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsDefined, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CheckoutTransactionInterface } from '../../interfaces/checkout';
import { AddressDto } from './address.dto';
import { ChannelSetUuidReferenceDto } from './channel-set-uuid-reference.dto';
import { PaymentFlowDto } from './payment-flow.dto';
import { TransactionBusinessDto } from './transaction-business.dto';
import { TransactionCartItemDto } from './transaction-cart-item.dto';
import { TransactionHistoryItemDto } from './transaction-history-item.dto';
import { TransactionPaymentDetailsDto } from './transaction-payment-details.dto';

@Exclude()
export class TransactionDto implements CheckoutTransactionInterface {
  @Expose()
  @IsString()
  @IsDefined()
  public id: string;

  @Expose()
  @IsString()
  @IsDefined()
  public uuid: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  public address?: AddressDto;

  @IsString()
  @IsOptional()
  public api_call_id?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TransactionBusinessDto)
  public business?: TransactionBusinessDto;

  @Expose()
  @ValidateNested()
  @Type(() => ChannelSetUuidReferenceDto)
  public channel_set: ChannelSetUuidReferenceDto;

  @Expose()
  @ValidateNested()
  @Type(() => PaymentFlowDto)
  public payment_flow: PaymentFlowDto;

  @Expose()
  @IsBoolean()
  public action_running: boolean;

  @Expose()
  @IsNumber()
  public amount: number;

  @Expose()
  @IsNumber()
  public business_option_id: number;

  @Expose()
  @IsString()
  public business_uuid: string;

  @Expose()
  @IsString()
  public channel: string;

  @Expose()
  @IsString()
  public channel_uuid: string;

  @Expose()
  @IsString()
  public channel_set_uuid: string;

  @Expose()
  @IsString()
  public created_at: string;

  @Expose()
  @IsString()
  public currency: string;

  @Expose()
  @IsString()
  public customer_email: string;

  @Expose()
  @IsString()
  public customer_name: string;

  @Expose()
  @IsNumber()
  public delivery_fee: number;

  @Expose()
  @IsNumber()
  public down_payment: number;

  @Expose()
  @IsString()
  public fee_accepted: boolean;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TransactionHistoryItemDto)
  public history: TransactionHistoryItemDto[];

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TransactionCartItemDto)
  public items: TransactionCartItemDto[];

  @Expose()
  @IsString()
  public merchant_email: string;

  @Expose()
  @IsString()
  public merchant_name: string;

  @Expose()
  @IsNumber()
  public payment_fee: number;

  @Expose()
  @IsString()
  public payment_flow_id: string;

  @Expose()
  @IsString()
  public place: string;

  @Expose()
  @IsString()
  public reference: string;

  @IsString({ each: true })
  @IsOptional()
  public santander_applications?: string[];

  @Expose()
  @ValidateNested()
  @Type(() => AddressDto)
  public shipping_address: AddressDto;

  @Expose()
  @IsString()
  public shipping_category: string;

  @Expose()
  @IsString()
  public shipping_method_name: string;

  @Expose()
  @IsString()
  public shipping_option_name: string;

  @Expose()
  @IsString()
  public specific_status: string;

  @Expose()
  @IsString()
  public status: string;

  @Expose()
  @IsString()
  public status_color: string;

  @Expose()
  @IsString()
  public store_id: string;

  @Expose()
  @IsString()
  public store_name: string;

  @Expose()
  @IsNumber()
  public total: number;

  @Expose()
  @IsString()
  public type: string;

  @Expose()
  @IsString()
  public updated_at: string;

  @Expose()
  @IsString()
  public user_uuid: string;

  @Expose()
  @IsString()
  public payment_type: string;

  @Expose()
  @ValidateNested()
  @Type(() => TransactionPaymentDetailsDto)
  public payment_details: TransactionPaymentDetailsDto;
}
