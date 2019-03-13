import { Schema } from 'mongoose';

export const AddressSchema = new Schema({
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
  type: String, // 'billing' | 'shipping'
  street: String,
  zip_code: String,
});
