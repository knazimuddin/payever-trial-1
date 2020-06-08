export interface SampleProductDto {
  _id: string;
  uuid: string;
  images: string[];
  description: string;
  identifier: string;
  name: string;
  price: number;
  price_net: number;
  quantity: number;
  vat_rate: number;
  industry: string;
  product: string;
  created_at: Date;
  updated_at: Date;
  title?: string;
  vatRate?: number;
  sku?: string;
}
