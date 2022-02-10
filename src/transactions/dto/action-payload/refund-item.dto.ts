import { IsNumber, IsString } from 'class-validator';

/**
 * @deprecated The class should not be used
 */
export class RefundItemDto {
  @IsString()
  public paymentItemId: string;

  @IsNumber()
  public count: number;
}
