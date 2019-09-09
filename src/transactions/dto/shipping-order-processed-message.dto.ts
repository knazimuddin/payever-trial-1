import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ShippingOrderProcessedMessageDto {
  @IsString()
  @IsNotEmpty()
  public transactionId: string;

  @IsString()
  public trackingNumber: string;

  @IsString()
  public trackingUrl: string;

  @IsString()
  @IsOptional()
  public deliveryDate?: string;
}
