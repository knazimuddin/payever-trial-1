import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class ExportedTransactionsMailDto {
  @IsString()
  @Expose()
  public to: string;

  @IsString()
  @Expose()
  public locale: string = 'en';

  @IsString()
  @Expose()
  public templateName: string;

  @Expose()
  public variables: {
    fileUrl: string;
  };
}
