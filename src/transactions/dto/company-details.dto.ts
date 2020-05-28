import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CompanyDetailsDto {
  @IsString()
  @IsNotEmpty()
  public product: string;

  @IsString()
  @IsOptional()
  public industry: string;
}
