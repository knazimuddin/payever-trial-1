import { TransactionFoldersIndexItemDto } from './transaction-folders-index-item.dto';
import { TransactionFoldersIndexAddressDto } from './transaction-folders-index-address.dto';

export class TransactionFoldersIndexDto {
  public id: string;
  public uuid: string;
  public original_id: string;
  public business_uuid: string;
  public reference: string;
  public created_at: Date;
  public type: string;
  public status: string;
  public specific_status: string;
  public channel: string;
  public amount: number;
  public total: number;
  public currency: string;
  public customer_name: string;
  public customer_email: string;
  public merchant_name: string;
  public merchant_email: string;
  public seller_name?: string;
  public seller_email?: string;
  public payment_details: string;
  public items: TransactionFoldersIndexItemDto[];
  public shipping_address: TransactionFoldersIndexAddressDto;
  public billing_address: TransactionFoldersIndexAddressDto;
}
