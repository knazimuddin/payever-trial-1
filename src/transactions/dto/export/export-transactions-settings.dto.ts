import { IsOptional, IsString } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ExportQueryDto } from './';

@Exclude()
export class ExportTransactionsSettingsDto {

  @Type(() => ExportQueryDto)
  @Expose()
  public exportDto: ExportQueryDto;

  @IsString()
  @Expose()
  @IsOptional()
  public businessId?: string;
}
