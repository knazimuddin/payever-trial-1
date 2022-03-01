import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

export const TransactionsArchiveAccessSchemaName: string = 'TransactionsArchiveAccess';

export const TransactionsArchiveAccessSchema: Schema = new Schema(
  {
    _id: {
      default: uuid,
      type: String,
    },
    businessId: {
      required: true,
      type: String,
    },
    key: {
      default: uuid,
      required: true,
      type: String,
    },
  },
  { },
);

TransactionsArchiveAccessSchema.index({ businessId: 1 });
