import { IsString, IsNotEmpty } from 'class-validator';

export class ShippingOrderReferenceDto {
  @IsString()
  @IsNotEmpty()
  public id: string;
}
