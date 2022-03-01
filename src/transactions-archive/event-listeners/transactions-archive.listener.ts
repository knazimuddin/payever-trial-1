import { Injectable } from '@nestjs/common';

import { EventListener } from '@pe/nest-kit';
// import { TransactionsArchiveEventsEnum } from '../enums';
import { TransactionsArchiveAccessService } from '../services';

@Injectable()
export class TransactionsArchiveEventListener {
  constructor(
    private readonly transactionsArchiveAccessService: TransactionsArchiveAccessService,
  ) { }

  // @EventListener(TransactionsArchiveEventsEnum.CreateArchivedTransaction)
  // public async onBusinessCreated(business: BusinessModel): Promise<void>  {
  //   await this.transactionsArchiveAccessService.createOrUpdateById(business);
  // }
}
