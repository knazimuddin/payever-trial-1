import { PaymentMailDto } from './payment-mail.dto';

export class ShippingMailDto extends PaymentMailDto {
  public variables: {
    trackingNumber: string;
    trackingUrl: string;
    deliveryDate: string;
  }
}
