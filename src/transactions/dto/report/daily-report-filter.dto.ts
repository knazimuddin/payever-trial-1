import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsDate } from 'class-validator';

export class DailyReportFilterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  @IsDate()
  public beginDate: Date;
}
