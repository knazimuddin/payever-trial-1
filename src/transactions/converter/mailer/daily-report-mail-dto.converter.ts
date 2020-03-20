import { Injectable } from '@nestjs/common';
import { DailyReportCurrencyDto, DailyReportMailDto, DailyReportPaymentOptionDto } from '../../dto';
import { environment } from '../../../environments';

@Injectable()
export class DailyReportMailDtoConverter {
  public static fromDailyReportCurrencyDto(
    dailyReportCurrencyDto: DailyReportCurrencyDto[],
  ): DailyReportMailDto {
    
    return {
      cc: environment.ccEmailDailyReport.split(','),
      dailyReport: dailyReportCurrencyDto,
      template_name: 'daily_report_transactions',
      to: environment.toEmailDailyReport,
    };
  }
}
