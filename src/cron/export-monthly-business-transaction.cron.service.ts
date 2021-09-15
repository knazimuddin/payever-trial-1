import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@pe/cron-kit';
import { ExportMonthlyBusinessTransactionService, ExportMonthlyUserPerBusinessTransactionService } from '../transactions/services';

@Injectable()
export class ExportMonthlyBusinessTransactionCronService {
  constructor(
    private readonly exportMonthlyBusinessTransactionService: ExportMonthlyBusinessTransactionService,
    private readonly exportMonthlyUserPerBusinessTransactionService: ExportMonthlyUserPerBusinessTransactionService,
  ) { }

  @Cron('0 0 0 1 * *', { name: 'exportMonthlyBusinessTransactions' })
  public async exportMonthlyBusinessTransactions(): Promise<void> {
    return this.exportMonthlyBusinessTransactionService.exportBusinessTransactionPreviousNMonth(1);
  }

  @Cron('0 0 0 1 * *', { name: 'exportMonthlyUserPerBusinessTransactions' })
  public async exportMonthlyUserPerBusinessTransactions(): Promise<void> {
    return this.exportMonthlyUserPerBusinessTransactionService.exportUserPerBusinessTransactionPreviousNMonth(1);
  }
}

