export interface TransactionItemInterface {
  readonly uuid: string;
  readonly description: string;
  readonly fixed_shipping_price: number;
  readonly identifier: string;
  readonly item_type: string;
  readonly name: string;
  readonly price: number;
  readonly price_net: number;
  readonly product_variant_uuid: string;
  readonly quantity: number;
  readonly shipping_price: number;
  readonly shipping_settings_rate: number;
  readonly shipping_settings_rate_type: string;
  readonly shipping_type: string;
  readonly thumbnail: string;
  readonly updated_at: Date;
  readonly url: string;
  readonly vat_rate: number;
  readonly weight: number;
  readonly created_at: Date;
}
