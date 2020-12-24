import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { DailyReportPaymentOptionDto } from './daily-report-payment-option.dto';

export class DailyReportCurrencyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  public currency: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsNumber()
  public todayTotal: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsNumber()
  public exchangeRate: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsNumber()
  public overallTotal: number;

  @ApiProperty()
  @IsDefined()
  @Type(() => DailyReportPaymentOptionDto)
  public paymentOption: DailyReportPaymentOptionDto[];
}
