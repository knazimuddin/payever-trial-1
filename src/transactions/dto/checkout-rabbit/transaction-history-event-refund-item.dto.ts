import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class TransactionHistoryEventRefundItemDto {
  @IsString()
  @IsNotEmpty()
  public item_uuid: string;

  @IsString()
  public identifier: string;

  @IsNumber()
  public count: number;
}
