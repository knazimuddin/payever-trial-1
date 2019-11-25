import { IsNotEmpty, IsString, ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { CompanyAddressDto } from './company-address.dto';

export class BusinessDto {
  @IsString()
  @IsNotEmpty()
  public _id: string;

  @IsString()
  @IsNotEmpty()
  public currency: string;

  @ValidateNested()
  @IsDefined()
  @Type(() => CompanyAddressDto)
  public companyAddress: CompanyAddressDto;

  @IsString()
  @IsNotEmpty()
  public name: string;

  public contactEmails: string[];
}
