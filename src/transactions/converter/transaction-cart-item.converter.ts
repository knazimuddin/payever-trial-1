import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { TransactionCartItemDto } from '../dto';
import { TransactionCartItemModel, SampleProductsModel } from '../models';
import { ProductUuid } from '../tools';

@Injectable()
export class TransactionCartItemConverter {

  public static fromSampleProducts(
    sampleProducts: SampleProductsModel[],
  ): Types.DocumentArray<TransactionCartItemModel> {
    const newCart: Types.DocumentArray<TransactionCartItemModel> = new Types.DocumentArray();

    for (const sample of sampleProducts) {
      const newCartItem: TransactionCartItemDto = {
        _id: sample._id,
        uuid: sample.uuid,

        created_at: sample.created_at,
        description: sample.description,
        fixed_shipping_price: null, //cartItem.fixed_shipping_price,
        identifier: sample.identifier,
        item_type: null, //cartItem.item_type,
        name: sample.name,
        //options: cartItem.options,
        price: sample.price,
        price_net: sample.price_net,
        product_variant_uuid: null, //cartItem.product_variant_uuid,
        quantity: sample.quantity,
        shipping_price: null, //cartItem.shipping_price,
        shipping_settings_rate: null, //cartItem.shipping_settings_rate,
        shipping_settings_rate_type: null, //cartItem.shipping_settings_rate_type,
        shipping_type: null, //cartItem.shipping_type,
        thumbnail: sample.images.length > 0 ? sample.images.shift() : "",
        updated_at: sample.updated_at,
        url: null, //cartItem.url,
        vat_rate: sample.vat_rate,
        weight: null, //cartItem.weight,
      };
      newCart.push(newCartItem);
    }

    return newCart;
  }
}
