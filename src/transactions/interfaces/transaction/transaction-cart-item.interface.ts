export interface TransactionCartItemInterface {
  _id: string;
  uuid: string;
  description: string;
  fixed_shipping_price: number;
  identifier: string;
  item_type: string;
  name: string;
  price: number;
  price_net: number;
  product_variant_uuid: string;
  quantity: number;
  shipping_price: number;
  shipping_settings_rate: number;
  shipping_settings_rate_type: string;
  shipping_type: string;
  thumbnail: string;
  updated_at: Date;
  url: string;
  vat_rate: number;
  weight: number;
  created_at: Date;
  options?: any[];
}
