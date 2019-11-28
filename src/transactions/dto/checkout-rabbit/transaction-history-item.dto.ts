import { IsString, IsNumber, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CheckoutTransactionHistoryItemInterface } from '../../interfaces/checkout';
import { HistoryEventUploadItemDto } from '../payment-micro/history-event-upload-item.dto';
import { TransactionHistoryEventRefundItemDto } from './transaction-history-event-refund-item.dto';

export class TransactionHistoryItemDto implements CheckoutTransactionHistoryItemInterface{
  @IsString()
  public action: string;
  @IsString()
  public payment_status: string;
  @IsNumber()
  public amount: number;
  @IsOptional()
  public params?: {};
  @IsString()
  @IsOptional()
  public reason?: string;
  @IsString()
  public created_at: string;
  @IsOptional()
  @IsBoolean()
  public items_restocked?: boolean;
  @IsBoolean()
  @IsOptional()
  public is_restock_items?: boolean;
  @IsOptional()
  @ValidateNested()
  @Type(() => HistoryEventUploadItemDto)
  public upload_items?: HistoryEventUploadItemDto[];
  @IsOptional()
  @ValidateNested()
  @Type(() => TransactionHistoryEventRefundItemDto)
  public refund_items?: TransactionHistoryEventRefundItemDto[];
}
