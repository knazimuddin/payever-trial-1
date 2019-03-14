export interface PaymentFlowInterface {
  readonly id: string;
  readonly amount: number;
  readonly shipping_fee: number;
  readonly shipping_method_code: string;
  readonly shipping_method_name: string;
  readonly tax_value: number;
  readonly currency: string;
  readonly reference: string;
  readonly salutation: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly country: string;
  readonly city: string;
  readonly zip_code: string;
  readonly street: string;
  readonly channel_set_uuid: string;
  readonly step: string;
  readonly state: string;
  readonly origin: string;
  readonly express: boolean;
  readonly callback: string;
  readonly x_frame_host: string;
}
