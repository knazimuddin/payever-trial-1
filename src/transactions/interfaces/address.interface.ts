import { AddressTypeEnum } from '../enum/address-type.enum';

export interface AddressInterface {
  readonly city: string;
  readonly company: string;
  readonly country: string; // code like de/en
  readonly country_name: string;
  readonly email: string;
  readonly fax: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly mobile_phone: string;
  readonly phone: string;
  readonly salutation: string;
  readonly social_security_number: string;
  readonly type: AddressTypeEnum;
  readonly street: string;
  readonly zip_code: string;
}
