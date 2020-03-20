import { DailyReportDto } from './daily-report.dto';

export class DailyReportMailDto {
  public to: string;
  public cc: string[] = [];
  public template_name: string;
  public dailyReport: DailyReportDto[];
}
