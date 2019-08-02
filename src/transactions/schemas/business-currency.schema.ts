import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

export const BusinessCurrencySchemaName: string = 'BusinessCurrency';
export const BusinessCurrencySchema = new Schema(
  {
    _id: { type: String, default: uuid },
    currency: String,
  }
);
