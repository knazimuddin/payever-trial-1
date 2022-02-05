import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

export const SampleProductSchemaName: string = 'SampleProducts';
export const SampleProductSchema: Schema = new Schema(
  {
    _id: {
      default: uuid,
      type: String,
    },
    description: String,
    identifier: String,
    images: [String],
    industry: String,
    name: String,
    price: {
      index: true,
      required: true,
      type: Number,
    },
    price_net: Number,
    product: String,
    quantity: Number,
    uuid: String,
    vat_rate: Number,
  },
  { timestamps: true },
);
