import { Injectable } from '@nestjs/common';
import { DailyReportDto, DailyReportMailDto } from '../../dto';
import { environment } from '../../../environments';

@Injectable()
export class DailyReportMailDtoConverter {
  public static fromDailyReportDto(dailyReportDto: DailyReportDto[]): DailyReportMailDto {
    
    return {
      cc: environment.ccEmailDailyReport.split(','),
      dailyReport: dailyReportDto,
      template_name: 'daily_report_transactions',
      to: environment.toEmailDailyReport,
    };
  }
}
