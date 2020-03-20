import { ApiModelProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class DailyReportDto {
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
  public overalTotal: number
}
