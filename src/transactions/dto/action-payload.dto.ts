import { Type } from 'class-transformer';
import { ApiModelProperty } from '@nestjs/swagger';

import { ValidateNested, IsOptional, IsNumber, IsString, Min, IsNotEmpty, IsBoolean } from 'class-validator';

class FileModelData {
  @IsString()
  type: string;

  @IsString()
  name: string;
}

class FileData {
  @IsString()
  url: string;
}

class RefundItem {
  @IsString()
  paymentItemId: string;
  @IsNumber()
  count: number;
}

class ReturnData {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @IsBoolean()
  @IsOptional()
  itemsRestocked: boolean;

  @IsString()
  @IsOptional()
  reason: boolean;

  @IsOptional()
  @ValidateNested()
  refundItems: [RefundItem];

  @IsOptional()
  @IsBoolean()
  refundCollectedBySepa: boolean;

  @IsOptional()
  @IsBoolean()
  refundGoodsReturned: boolean;

  @IsOptional()
  @IsString()
  refundInvoiceNumber: string;
}

class CancelData {
  @IsOptional()
  // @IsString()
  @IsNumber()
  reason: string;

  @IsString()
  reason2: string;
}

class UploadData {
  @ValidateNested()
  models: [FileModelData];
}

class ShippingGoodsData {}

class AuthorizeData {}

class UpdateDataInfo {

  @IsOptional()
  @IsString()
  deliveryFee: string;

  // Product Items array. Is it really required will all fields?
  @IsOptional()
  productLine: any[];
}

class UpdateData {

  @IsOptional()
  @IsString()
  reason: string;

  @ValidateNested()
  updateData: UpdateDataInfo;
}

class VoidData {}

class ChangeAmountData {
  @IsString()
  amount: string;
}

class ReminderData {
  @IsNumber()
  ChangeAmount: number;
}

class FieldsDto {
  /* Remove this layer of wrapping */

  @IsOptional()
  @ValidateNested()
  payment_return: ReturnData;

  @IsOptional()
  @ValidateNested()
  payment_cancel: CancelData;

  @IsOptional()
  @ValidateNested()
  payment_upload: UploadData;

  @IsOptional()
  @ValidateNested()
  payment_shipping_goods: ShippingGoodsData;

  @IsOptional()
  @ValidateNested()
  payment_authorize: AuthorizeData;

  @IsOptional()
  @ValidateNested()
  payment_update: UpdateData;

  @IsOptional()
  @ValidateNested()
  payment_void: VoidData;

  @IsOptional()
  @ValidateNested()
  payment_change_amount: ChangeAmountData;

  @IsOptional()
  @ValidateNested()
  payment_reminder: ReminderData;
}

export class ActionPayloadDto {

  @ApiModelProperty()
  @ValidateNested()
  fields: FieldsDto;

  @ApiModelProperty()
  @ValidateNested()
  files: [FileData];

}
