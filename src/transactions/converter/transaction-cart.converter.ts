import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { TransactionCartItemDto } from '../dto';
import { CheckoutTransactionCartItemInterface } from '../interfaces/checkout';
import { TransactionCartItemModel } from '../models';
import { ProductUuid } from '../tools';

@Injectable()
export class TransactionCartConverter {

  public static fromCheckoutTransactionCart(
    cartItems: CheckoutTransactionCartItemInterface[],
    businessId: string,
  ): Types.DocumentArray<TransactionCartItemModel> {
    const newCart: Types.DocumentArray<TransactionCartItemModel> = new Types.DocumentArray();

    for (const cartItem of cartItems) {
      const itemIdentifier: string =
        cartItem.product_uuid
          ? cartItem.product_uuid
          : ProductUuid.generate(businessId, `${cartItem.name}${cartItem.identifier}`);

      const newCartItem: TransactionCartItemDto = {
        _id: itemIdentifier,
        uuid: cartItem.product_uuid
          ? cartItem.product_uuid
          : null
        ,

        created_at: cartItem.created_at,
        description: cartItem.description,
        fixed_shipping_price: cartItem.fixed_shipping_price,
        identifier: cartItem.identifier,
        item_type: cartItem.item_type,
        name: cartItem.name,
        options: cartItem.options,
        price: cartItem.price,
        price_net: cartItem.price_net,
        product_variant_uuid: cartItem.product_variant_uuid,
        quantity: cartItem.quantity,
        shipping_price: cartItem.shipping_price,
        shipping_settings_rate: cartItem.shipping_settings_rate,
        shipping_settings_rate_type: cartItem.shipping_settings_rate_type,
        shipping_type: cartItem.shipping_type,
        sku: cartItem.sku,
        thumbnail: cartItem.thumbnail,
        updated_at: cartItem.updated_at,
        url: cartItem.url,
        vat_rate: cartItem.vat_rate,
        weight: cartItem.weight,
      };

      newCart.push(newCartItem);
    }

    return newCart;
  }
}
