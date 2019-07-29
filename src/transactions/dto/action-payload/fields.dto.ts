import { IsOptional, ValidateNested } from 'class-validator';
import { FieldsInterface, UnwrappedFieldsInterface } from '../../interfaces/action-payload';
import { AuthorizeDataDto } from './authorize-data.dto';
import { CancelDataDto } from './cancel-data.dto';
import { CaptureDataDto } from './capture-data.dto';
import { ChangeAmountDataDto } from './change-amount-data.dto';
import { ReminderDataDto } from './reminder-data.dto';
import { ReturnDataDto } from './return-data.dto';
import { ShippingGoodsDataDto } from './shipping-goods-data.dto';
import { UpdateDataDto } from './update-data.dto';
import { UploadDataDto } from './upload-data.dto';
import { VoidDataDto } from './void-data.dto';

export class FieldsDto implements FieldsInterface, UnwrappedFieldsInterface {
  /* Remove this layer of wrapping */
  @IsOptional()
  @ValidateNested()
  public payment_capture: CaptureDataDto;

  @IsOptional()
  @ValidateNested()
  public capture_funds: CaptureDataDto;

  @IsOptional()
  @ValidateNested()
  public payment_return: ReturnDataDto;

  @IsOptional()
  @ValidateNested()
  public payment_cancel: CancelDataDto;

  @IsOptional()
  @ValidateNested()
  public payment_upload: UploadDataDto;

  @IsOptional()
  @ValidateNested()
  public payment_shipping_goods: ShippingGoodsDataDto;

  @IsOptional()
  @ValidateNested()
  public payment_authorize: AuthorizeDataDto;

  @IsOptional()
  @ValidateNested()
  public payment_update: UpdateDataDto;

  @IsOptional()
  @ValidateNested()
  public payment_void: VoidDataDto;

  @IsOptional()
  @ValidateNested()
  public payment_change_amount: ChangeAmountDataDto;

  @IsOptional()
  @ValidateNested()
  public payment_reminder: ReminderDataDto;

  @IsOptional()
  public amount?: number;

  @IsOptional()
  public reason?: string | boolean;

  @IsOptional()
  public refunded_amount?: number;

  @IsOptional()
  public refundedAmount?: number;

  @IsOptional()
  public payment_items?: any[];

  @IsOptional()
  public delivery_fee?: number;
}
