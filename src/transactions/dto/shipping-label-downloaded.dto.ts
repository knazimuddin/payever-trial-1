import { ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { ShippingOrderReferenceDto } from './shipping-order-reference.dto';

export class ShippingLabelDownloadedDto {
  @ValidateNested()
  @IsDefined()
  @Type(() => ShippingOrderReferenceDto)
  public shippingOrder: ShippingOrderReferenceDto;
}
