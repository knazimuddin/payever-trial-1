import { Type } from 'class-transformer';
import { IsBoolean, IsDefined, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CheckoutTransactionInterface } from '../../interfaces/checkout';
import { AddressDto } from './address.dto';
import { ChannelSetUuidReferenceDto } from './channel-set-uuid-reference.dto';
import { PaymentFlowDto } from './payment-flow.dto';
import { TransactionBusinessDto } from './transaction-business.dto';
import { TransactionCartItemDto } from './transaction-cart-item.dto';
import { TransactionHistoryItemDto } from './transaction-history-item.dto';
import { TransactionPaymentDetailsDto } from './transaction-payment-details.dto';

export class TransactionDto implements CheckoutTransactionInterface {
  @IsString()
  @IsDefined()
  public id: string;

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

  @ValidateNested()
  @Type(() => ChannelSetUuidReferenceDto)
  public channel_set: ChannelSetUuidReferenceDto;

  @ValidateNested()
  @Type(() => PaymentFlowDto)
  public payment_flow: PaymentFlowDto;

  @IsBoolean()
  public action_running: boolean;

  @IsNumber()
  public amount: number;

  @IsNumber()
  public business_option_id: number;

  @IsString()
  public business_uuid: string;

  @IsString()
  public channel: string;

  @IsString()
  public channel_uuid: string;

  @IsString()
  public channel_set_uuid: string;

  @IsString()
  public created_at: string;

  @IsString()
  public currency: string;

  @IsString()
  public customer_email: string;

  @IsString()
  public customer_name: string;

  @IsNumber()
  public delivery_fee: number;

  @IsNumber()
  public down_payment: number;

  @IsBoolean()
  public fee_accepted: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TransactionHistoryItemDto)
  public history: TransactionHistoryItemDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TransactionCartItemDto)
  public items: TransactionCartItemDto[];

  @IsString()
  public merchant_email: string;

  @IsString()
  public merchant_name: string;

  @IsNumber()
  public payment_fee: number;

  @IsString()
  public payment_flow_id: string;

  @IsString()
  public place: string;

  @IsString()
  public reference: string;

  @IsString({ each: true })
  @IsOptional()
  public santander_applications: string[];

  @ValidateNested()
  @Type(() => AddressDto)
  public shipping_address: AddressDto;

  @IsString()
  public shipping_category: string;

  @IsString()
  public shipping_method_name: string;

  @IsString()
  public shipping_option_name: string;

  @IsString()
  public specific_status: string;

  @IsString()
  public status: string;

  @IsString()
  public status_color: string;

  @IsString()
  public store_id: string;

  @IsString()
  public store_name: string;

  @IsNumber()
  public total: number;

  @IsString()
  public type: string;

  @IsString()
  public updated_at: string;

  @IsString()
  public user_uuid: string;

  @IsString()
  public payment_type: string;

  @ValidateNested()
  @Type(() => TransactionPaymentDetailsDto)
  public payment_details: TransactionPaymentDetailsDto;

  @IsBoolean()
  public test_mode: boolean;
}
