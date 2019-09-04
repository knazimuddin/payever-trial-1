import { IsNotEmpty, IsString } from 'class-validator';

export class BusinessDto {
  @IsString()
  @IsNotEmpty()
  public _id: string;

  @IsString()
  @IsNotEmpty()
  public currency: string;

  public companyAddress: {
    country: string;
  };

  @IsString()
  @IsNotEmpty()
  public name: string;

  public contactEmails: string[];
}
