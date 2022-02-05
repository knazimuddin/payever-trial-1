import { Injectable } from '@nestjs/common';

import { EventListener } from '@pe/nest-kit';
import { BusinessModel, BusinessEventsEnum } from '@pe/business-kit';
import { TransactionsArchiveAccessService } from '../services';

@Injectable()
export class BusinessEventListener {
  constructor(
    private readonly transactionsArchiveAccessService: TransactionsArchiveAccessService,
  ) { }

  @EventListener(BusinessEventsEnum.BusinessCreated)
  public async onBusinessCreated(business: BusinessModel): Promise<void>  {
    await this.transactionsArchiveAccessService.createOrUpdateById(business);
  }

  @EventListener(BusinessEventsEnum.BusinessUpdated)
  public async onBusinessUpdated(business: BusinessModel): Promise<void>  {
    await this.transactionsArchiveAccessService.createOrUpdateById(business);
  }

  @EventListener(BusinessEventsEnum.BusinessExport)
  public async onBusinessExport(business: BusinessModel): Promise<void>  {
    await this.transactionsArchiveAccessService.createOrUpdateById(business);
  }
}
