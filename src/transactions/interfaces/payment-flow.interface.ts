import { BusinessPaymentOptionInterface } from './business-payment-option.interface';

export interface PaymentFlowInterface {
  id: string;
  amount: number;
  shipping_fee: number;
  shipping_method_code?: string;
  shipping_method_name?: string;
  tax_value: number;
  currency?: string;
  reference?: string;
  salutation?: string;
  first_name?: string;
  last_name?: string;
  country?: string;
  city?: string;
  zip_code?: string;
  street?: string;
  channel_set_uuid?: string;
  step: string;
  state?: string;
  origin?: string;
  express?: boolean;
  callback?: string;
  x_frame_host?: string;
  business_payment_option?: BusinessPaymentOptionInterface;
}
