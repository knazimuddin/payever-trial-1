import { FieldsInterface } from './fields.interface';
import { FileDataInterface } from './file-data.interface';
import { UnwrappedFieldsInterface } from './unwrapped-fields.interface';

export interface ActionPayloadInterface {
  fields?: FieldsInterface & UnwrappedFieldsInterface;
  files?: [FileDataInterface];
}
