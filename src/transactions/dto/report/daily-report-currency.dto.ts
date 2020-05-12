import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { DailyReportPaymentOptionDto } from './daily-report-payment-option.dto';

export class DailyReportCurrencyDto {
  @ApiModelProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  public currency: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsNumber()
  public todayTotal: number;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsNumber()
  public exchangeRate: number;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsNumber()
  public overallTotal: number;

  @ApiModelProperty()
  @IsDefined()
  @Type(() => DailyReportPaymentOptionDto)
  public paymentOption: DailyReportPaymentOptionDto[];
}
