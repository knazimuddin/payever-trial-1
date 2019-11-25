import { IsString, IsNotEmpty } from 'class-validator';

export class CompanyAddressDto {
  @IsString()
  @IsNotEmpty()
  public country: string;
}
