import { FieldsInterface } from './fields.interface';
import { FileDataInterface } from './file-data.interface';
import { UnwrappedFieldsInterface } from './unwrapped-fields.interface';

export interface ActionPayloadInterface {
  paymentId?: string;
  fields?: FieldsInterface & UnwrappedFieldsInterface;
  files?: FileDataInterface[];
  testMode?: boolean;
}
