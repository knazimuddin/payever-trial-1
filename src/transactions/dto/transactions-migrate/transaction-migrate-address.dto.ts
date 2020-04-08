import { IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TransactionMigrateAddressDto {
  @IsString()
  @Expose()
  public city: string;

  @IsString()
  @Expose()
  public country: string;

  @IsString()
  @Expose()
  public country_name: string;

  @IsString()
  @Expose()
  public street: string;

  @IsString()
  @Expose()
  public zip_code: string;
}
