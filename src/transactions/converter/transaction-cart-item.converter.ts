import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { SampleProductDto, TransactionCartItemDto } from '../dto';
import { TransactionCartItemModel } from '../models';

@Injectable()
export class TransactionCartItemConverter {

  public static fromSampleProducts(
    sampleProducts: SampleProductDto[],
  ): Types.DocumentArray<TransactionCartItemModel> {
    const newCart: Types.DocumentArray<TransactionCartItemModel> = new Types.DocumentArray();

    for (const sample of sampleProducts) {
      const newCartItem: TransactionCartItemDto = {
        _id: sample._id,
        uuid: sample.uuid,

        created_at: sample.created_at,
        description: sample.description,
        fixed_shipping_price: null,
        identifier: sample.sku,
        item_type: null,
        name: sample.title,
        price: sample.price,
        price_net: sample.price,
        product_variant_uuid: null,
        quantity: 1,
        shipping_price: null,
        shipping_settings_rate: null,
        shipping_settings_rate_type: null,
        shipping_type: null,
        sku: null,
        thumbnail: sample.images.length > 0 ? sample.images[0] : '',
        updated_at: sample.updated_at,
        url: null,
        vat_rate: sample.vatRate,
        weight: null,
      };
      newCart.push(newCartItem);
    }

    return newCart;
  }
}
