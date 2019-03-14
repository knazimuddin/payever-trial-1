export interface BusinessPaymentOptionInterface {
  readonly id: number;
  readonly uuid: string;
  readonly payment_option_id: number;
  readonly accept_fee: boolean;
  readonly status: string;
  readonly fixed_fee: number;
  readonly variable_fee: number;
  readonly credentials: object;
  readonly options: string;
  readonly completed: boolean;
  readonly shop_redirect_enabled: boolean;
}
