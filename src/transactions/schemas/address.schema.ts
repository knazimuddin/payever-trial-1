import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { AddressTypeEnum } from '../enum';

export const AddressSchema: Schema = new Schema({
  _id: { type: String, default: uuid },
  city: String,
  company: String,
  country: String, // code like de/en
  country_name: String,
  email: String,
  fax: String,
  first_name: String,
  last_name: String,
  mobile_phone: String,
  phone: String,
  salutation: String,
  social_security_number: String,
  street: String,
  type: { type: String, enum: [AddressTypeEnum.Billing, AddressTypeEnum.Shipping] },
  zip_code: String,
});
