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
        fixed_shipping_price: null,
        identifier: sample.identifier,
        item_type: null,
        name: sample.name,
        price: sample.price,
        price_net: sample.price_net,
        product_variant_uuid: null,
        quantity: sample.quantity,
        shipping_price: null,
        shipping_settings_rate: null,
        shipping_settings_rate_type: null,
        shipping_type: null,
        thumbnail: sample.images.length > 0 ? sample.images[0] : '',
        updated_at: sample.updated_at,
        url: null,
        vat_rate: sample.vat_rate,
        weight: null,
      };
      newCart.push(newCartItem);
    }

    return newCart;
  }
}
