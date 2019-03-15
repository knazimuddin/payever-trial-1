import { AddressTypeEnum } from '../enum/address-type.enum';

export interface AddressInterface {
  city: string;
  company: string;
  country: string; // code like de/en
  country_name: string;
  email: string;
  fax: string;
  first_name: string;
  last_name: string;
  mobile_phone: string;
  phone: string;
  salutation: string;
  social_security_number: string;
  type: AddressTypeEnum;
  street: string;
  zip_code: string;
}
