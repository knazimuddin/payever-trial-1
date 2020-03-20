import { DailyReportCurrencyDto } from './daily-report-currency.dto';
import { DailyReportPaymentOptionDto } from './daily-report-payment-option.dto';

export class DailyReportMailDto {
  public to: string;
  public cc: string[] = [];
  public template_name: string;
  public dailyReport: DailyReportCurrencyDto[];
}
