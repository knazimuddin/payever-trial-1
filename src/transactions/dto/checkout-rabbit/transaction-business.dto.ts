import { IsString } from 'class-validator';

export class TransactionBusinessDto {
  @IsString()
  public uuid: string;
  @IsString()
  public company_name: string;
  @IsString()
  public company_email: string;
}
