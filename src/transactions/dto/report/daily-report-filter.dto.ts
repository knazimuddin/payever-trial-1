import { ApiModelProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsDate } from 'class-validator';

export class DailyReportFilterDto {
  @ApiModelProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsDate()
  public beginDate: Date;
}
