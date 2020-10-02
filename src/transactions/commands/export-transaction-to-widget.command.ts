import { Injectable } from '@nestjs/common';
import { Command } from '@pe/nest-kit';
import { ExportMonthlyBusinessTransactionService } from '../services';

@Injectable()
export class ExportTransactionToWidgetCommand {
  constructor(
    private readonly exportMonthlyBusinessTransactionService: ExportMonthlyBusinessTransactionService,
  ) { }


  @Command({ command: 'export:transaction:widget', describe: 'Export last 3 months transaction to widget' })
  public async expostTransactionWidget(): Promise<void> {
    await this.exportMonthlyBusinessTransactionService.exportBusinessTransactionPreviousNMonth(0);
    await this.exportMonthlyBusinessTransactionService.exportBusinessTransactionPreviousNMonth(1);
    await this.exportMonthlyBusinessTransactionService.exportBusinessTransactionPreviousNMonth(2);
  }
}
