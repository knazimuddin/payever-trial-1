import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class HistoryEventRefundItemDto {
  @IsString()
  @IsNotEmpty()
  public payment_item_id: string;

  @IsNumber()
  public count: number;
}
