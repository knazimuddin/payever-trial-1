import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TransactionExportHistoryDto {
  @IsString()
  @Expose()
  public action: string;

  @IsNumber()
  @Expose()
  public amount: number;

  @IsOptional()
  @IsString()
  @Expose()
  public payment_status?: string;

  @IsString()
  @Expose()
  public reason: string;

  @IsOptional()
  @IsDateString()
  @Expose()
  public created_at?: Date;
}
