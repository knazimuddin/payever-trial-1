import { AddressInterface } from './address.interface';
import { BusinessInterface } from './business.interface';
import { ChannelSetInterface } from './channel-set.interface';
import { CheckoutPaymentDetailsAwareInterface } from './checkout-payment-details-aware.interface';
import { CheckoutTransactionCartItemInterface } from './checkout-transaction-cart-item.interface';
import { CheckoutTransactionHistoryItemInterface } from './checkout-transaction-history-item.interface';
import { PaymentFlowInterface } from './payment-flow.interface';

export interface CheckoutTransactionInterface extends CheckoutPaymentDetailsAwareInterface {
  id: string;
  uuid: string;

  address: AddressInterface;
  business: BusinessInterface;
  channel_set: ChannelSetInterface;
  payment_flow: PaymentFlowInterface;

  action_running: boolean;
  amount: number;
  business_option_id: number;
  business_uuid: string;
  channel: string; // 'store', ...
  channel_uuid: string;
  channel_set_uuid: string;
  created_at: Date;
  currency: string;
  customer_email: string;
  customer_name: string;
  delivery_fee: number;
  down_payment: number;
  fee_accepted: boolean;
  history: CheckoutTransactionHistoryItemInterface[];
  items: CheckoutTransactionCartItemInterface[];
  merchant_email: string;
  merchant_name: string;
  payment_fee: number;
  payment_flow_id: string;
  place: string;
  reference: string;
  santander_applications: string[];
  shipping_address: AddressInterface;
  shipping_category: string;
  shipping_method_name: string;
  shipping_option_name: string;
  specific_status: string;
  status: string;
  status_color: string;
  store_id: string;
  store_name: string;
  total: number;
  type: string;
  updated_at: Date;
  user_uuid: string;
  payment_type: string;
}
