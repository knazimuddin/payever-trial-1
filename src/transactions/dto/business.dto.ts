import { IsNotEmpty, IsString, ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { CompanyAddressDto } from './company-address.dto';
import { CompanyDetailsDto } from './company-details.dto';

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

  @ValidateNested()
  @IsDefined()
  @Type(() => CompanyDetailsDto)
  public companyDetails?: CompanyDetailsDto;

  @IsString()
  @IsNotEmpty()
  public name: string;

  public contactEmails: string[];
}
