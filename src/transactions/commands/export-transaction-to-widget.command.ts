import { Injectable } from '@nestjs/common';
import { Command, Positional } from '@pe/nest-kit';
import {
  ExportMonthlyBusinessTransactionService,
  ExportUserPerBusinessTransactionService,
} from '../services';

@Injectable()
export class ExportTransactionToWidgetCommand {
  constructor(
    private readonly exportMonthlyBusinessTransactionService: ExportMonthlyBusinessTransactionService,
    private readonly exportUserPerBusinessTransactionService: ExportUserPerBusinessTransactionService,
  ) { }


  @Command(
    {
      command: 'export:transaction:widget <monthCount>',
      describe: 'Export last n months transaction to widget',
    },
  )
  public async exportTransactionWidget(
    @Positional({ name: 'monthCount' })  monthCount: number,
  ): Promise<void> {
    for (let i: number = 0; i <= monthCount; i++) {
      await this.exportMonthlyBusinessTransactionService.exportBusinessTransactionPreviousNMonth(i);
      await this.exportUserPerBusinessTransactionService.exportUserPerBusinessTransactionPreviousNMonth(i);
    }
    await this.exportUserPerBusinessTransactionService.exportUserPerBusinessTransactionTotal();
  }
}
