import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DailyReportPaymentOptionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  public paymentOption: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsNumber()
  public todayTotal: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsNumber()
  public overallTotal: number;
}
