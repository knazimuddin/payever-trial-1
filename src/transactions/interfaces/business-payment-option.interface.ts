export interface BusinessPaymentOptionInterface {
  id: number;
  uuid: string;
  payment_option_id: number;
  accept_fee: boolean;
  status: string;
  fixed_fee: number;
  variable_fee: number;
  credentials: object;
  options: string;
  completed: boolean;
  shop_redirect_enabled: boolean;
}
