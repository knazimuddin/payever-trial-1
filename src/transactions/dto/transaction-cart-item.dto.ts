import { TransactionCartItemInterface } from '../interfaces/transaction';

export class TransactionCartItemDto implements TransactionCartItemInterface {
  public _id: string;
  public uuid: string;
  public description: string;
  public fixed_shipping_price: number;
  public identifier: string;
  public item_type: string;
  public name: string;
  public price: number;
  public price_net: number;
  public product_variant_uuid: string;
  public quantity: number;
  public shipping_price: number;
  public shipping_settings_rate: number;
  public shipping_settings_rate_type: string;
  public shipping_type: string;
  public thumbnail: string;
  public updated_at: Date;
  public url: string;
  public vat_rate: number;
  public weight: number;
  public created_at: Date;
  public options: any[];
}
