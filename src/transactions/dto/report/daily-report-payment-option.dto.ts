import { ApiModelProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class DailyReportPaymentOptionDto {
  @ApiModelProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  public paymentOption: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsNumber()
  public todayTotal: number;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsNumber()
  public overallTotal: number
}