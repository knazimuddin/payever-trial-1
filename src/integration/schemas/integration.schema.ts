import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { FeaturesSchema } from './features.schema';

export const IntegrationSchema = new Schema(
  {
    _id: { type: String, default: uuid },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    features: FeaturesSchema,
  },
  {
    timestamps: {},
  },
);
