import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { RefundItemDto } from './refund-item.dto';

export class ReturnDataDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  public amount: number;

  @IsBoolean()
  @IsOptional()
  public itemsRestocked: boolean;

  @IsString()
  @IsOptional()
  public reason: string;

  @IsOptional()
  @ValidateNested()
  public refundItems: [RefundItemDto];

  @IsOptional()
  @IsBoolean()
  public refundCollectedBySepa: boolean;

  @IsOptional()
  @IsBoolean()
  public refundGoodsReturned: boolean;

  @IsOptional()
  @IsString()
  public refundInvoiceNumber: string;
}
