import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

export const FeaturesSchema: Schema = new Schema(
  {
    _id: { type: String, default: uuid },
    editActionAlias: String,
    isInvoiceIdEditable: Boolean,
  },
);
