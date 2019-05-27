import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

export const FeaturesSchema = new Schema(
  {
    _id: { type: String, default: uuid },
    isInvoiceIdEditable: Boolean,
    editActionAlias: String,
  },
);
