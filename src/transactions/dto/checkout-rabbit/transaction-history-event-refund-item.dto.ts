import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class TransactionHistoryEventRefundItemDto {
  @IsString()
  @IsNotEmpty()
  public item_uuid: string;

  @IsNumber()
  public count: number;
}
