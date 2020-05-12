import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ShippingGoodsDto {
  @ApiModelProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  public businessName: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  public transactionId: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsDate()
  public transactionDate: Date;

  @ApiModelPropertyOptional()
  @IsOptional()
  @IsString()
  public shipmentDate?: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  public shippingOrderId: string;
}
