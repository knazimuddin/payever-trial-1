import { IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TransactionMigrateBusinessDto {
  @IsString()
  @Expose({ name: 'business_uuid' })
  public uuid: string;

  @IsString()
  @Expose({ name: 'merchant_name' })
  public company_name: string;
}
