import { IsString } from 'class-validator';
import { AddressTypeEnum } from '../../enum';

export class AddressDto {
  @IsString()
  public city: string;
  @IsString()
  public company: string;
  @IsString()
  public country: string;
  @IsString()
  public country_name: string;
  @IsString()
  public email: string;
  @IsString()
  public fax: string;
  @IsString()
  public first_name: string;
  @IsString()
  public last_name: string;
  @IsString()
  public mobile_phone: string;
  @IsString()
  public phone: string;
  @IsString()
  public salutation: string;
  @IsString()
  public social_security_number: string;
  @IsString()
  public type: AddressTypeEnum;
  @IsString()
  public street: string;
  @IsString()
  public zip_code: string;
}
