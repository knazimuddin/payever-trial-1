import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@pe/cron-kit';
import { ExportMonthlyBusinessTransactionService } from '.';

@Injectable()
export class CronService {
  constructor(
    private readonly exportMonthlyBusinessTransactionService: ExportMonthlyBusinessTransactionService,
  ) { }

  @Cron('0 0 0 1 * *', { name: 'exportMonthlyBusinessTransactions' })
  public async exportMonthlyBusinessTransactions(): Promise<void> {
    return this.exportMonthlyBusinessTransactionService.exportBusinessTransactionPreviousNMonth(1);
  }
}

