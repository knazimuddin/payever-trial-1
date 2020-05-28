import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

export const SampleProductSchemaName: string = 'SampleProducts';
export const SampleProductSchema: Schema = new Schema(
  {
    _id: { 
      default: uuid, type: String 
    },
    industry: String,
    product: String,
    uuid: String,
    description: String,
    identifier: String,
    images: [String],
    name: String,
    price: {
      index: true,
      required: true,
      type: Number,
    },
    price_net: Number,
    quantity: Number,
    vat_rate: Number,    
  },
  { timestamps: true },
);
