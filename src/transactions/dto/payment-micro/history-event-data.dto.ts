import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { HistoryEventRefundItemDto } from './history-event-refund-item.dto';
import { HistoryEventUploadItemDto } from './history-event-upload-item.dto';

export class HistoryEventDataDto {
  @IsNumber()
  public amount: number;

  @IsString()
  public payment_status: string;

  @IsString()
  public reason: string;

  @IsString()
  @IsOptional()
  public params?: string;

  @IsBoolean()
  public items_restocked: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HistoryEventRefundItemDto)
  public refund_items?: HistoryEventRefundItemDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HistoryEventUploadItemDto)
  public saved_data?: HistoryEventUploadItemDto[];
}
