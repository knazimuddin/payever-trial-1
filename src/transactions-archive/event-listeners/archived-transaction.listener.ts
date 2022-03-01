import { Injectable } from '@nestjs/common';

import { EventListener } from '@pe/nest-kit';
import { ArchivedTransactionEventsEnum } from '../enums';
import { ArchivedTransactionModel } from '../models';
import { ArchivedTransactionAccessService } from '../services';

@Injectable()
export class ArchivedTransactionEventListener {
  constructor(
    private readonly archivedTransactionAccessService: ArchivedTransactionAccessService,
  ) { }

  @EventListener(ArchivedTransactionEventsEnum.Created)
  public async onBusinessCreated(archivedTransaction: ArchivedTransactionModel): Promise<void>  {
    await this.archivedTransactionAccessService.index(archivedTransaction);
  }
}
