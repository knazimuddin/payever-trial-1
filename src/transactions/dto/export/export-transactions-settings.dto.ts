import { IsOptional, IsString, IsNumber, IsDefined } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ExportQueryDto } from './';

@Exclude()
export class ExportTransactionsSettingsDto {

  @Type(() => ExportQueryDto)
  @Expose()
  public exportDto: ExportQueryDto;

  @IsString()
  @Expose()
  @IsDefined()
  public sendEmailTo: string;

  @IsString()
  @Expose()
  @IsOptional()
  public businessId?: string;

  @IsString()
  @Expose()
  @IsOptional()
  public fileName?: string;

  @IsNumber()
  @Expose()
  public transactionsCount: number;

  @IsString()
  @Expose()
  @IsOptional()
  public userId?: string;

}
