import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { FeaturesSchema } from './features.schema';

export const IntegrationSchema: Schema = new Schema(
  {
    _id: { type: String, default: uuid },
    category: {
      required: true,
      type: String,
    },
    features: FeaturesSchema,
    name: {
      required: true,
      type: String,
      unique: true,
    },
  },
  {
    timestamps: {},
  },
);
