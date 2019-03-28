import { IsNumber, IsString } from 'class-validator';

export class RefundItemDto {
  @IsString()
  public paymentItemId: string;

  @IsNumber()
  public count: number;
}
