import { AddressInterface, TransactionCartItemInterface, TransactionPackedDetailsInterface } from '../interfaces';
import {
  TransactionFoldersIndexAddressDto,
  TransactionFoldersIndexDto,
  TransactionFoldersIndexItemDto,
} from '../dto';

export class TransactionTransformer {

  public static transactionToFoldersIndex(
    transaction: TransactionPackedDetailsInterface,
  ): TransactionFoldersIndexDto {
    return {
      amount: transaction.amount,
      amount_left: transaction.amount_left,
      billing_address: TransactionTransformer.addressToFoldersAddress(transaction.billing_address),
      business_uuid: transaction.business_uuid,
      channel: transaction.channel,
      created_at: transaction.created_at,
      currency: transaction.currency,
      customer_email: transaction.customer_email,
      customer_name: transaction.customer_name,
      id: transaction.uuid,
      items: TransactionTransformer.itemsToFolderItems(transaction.items),
      merchant_email: transaction.merchant_email,
      merchant_name: transaction.merchant_name,
      original_id: transaction.original_id,
      payment_details: transaction.payment_details,
      reference: transaction.reference,
      seller_email: transaction.seller_email,
      seller_name: transaction.seller_name,
      shipping_address: TransactionTransformer.addressToFoldersAddress(transaction.shipping_address),
      specific_status: transaction.specific_status,
      status: transaction.status,
      total: transaction.total,
      total_left: transaction.total_left,
      type: transaction.type,
      uuid: transaction.uuid,
    };
  }

  private static addressToFoldersAddress(address: AddressInterface): TransactionFoldersIndexAddressDto {
    return address ? {
      city: address.city,
      company: address.company,
      country_name: address.country_name,
      phone: address.phone,
      street: address.street,
      zip_code: address.zip_code,
    } : undefined;
  }

  private static itemsToFolderItems(items: TransactionCartItemInterface[]): TransactionFoldersIndexItemDto[] {
    return items.map((item: TransactionCartItemInterface) => ({
      name: item.name,
      options: item.options,
      price: item.price,
      quantity: item.quantity,
      sku: item.sku,
      uuid: item.uuid,
      vat_rate: item.vat_rate,
    }));
  }
}
