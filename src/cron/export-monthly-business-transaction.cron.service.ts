import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@pe/cron-kit';
import { ExportMonthlyBusinessTransactionService } from '../transactions/services/export-monthly-business-transaction.service';

@Injectable()
export class ExportMonthlyBusinessTransactionCronService {
  constructor(
    private readonly exportMonthlyBusinessTransactionService: ExportMonthlyBusinessTransactionService,
  ) { }

  @Cron('0 0 0 1 * *', { name: 'exportMonthlyBusinessTransactions' })
  public async exportMonthlyBusinessTransactions(): Promise<void> {
    return this.exportMonthlyBusinessTransactionService.exportBusinessTransactionPreviousNMonth(1);
  }
}

