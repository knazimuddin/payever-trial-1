import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ShippingGoodsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  public businessName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  public transactionId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsDate()
  public transactionDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  public shipmentDate?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  public shippingOrderId: string;
}
