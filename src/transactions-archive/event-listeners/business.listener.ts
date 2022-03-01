import { Injectable } from '@nestjs/common';

import { EventListener } from '@pe/nest-kit';
import { BusinessModel, BusinessEventsEnum } from '@pe/business-kit';
import { ArchivedTransactionAccessService } from '../services';

@Injectable()
export class BusinessEventListener {
  constructor(
    private readonly archivedTransactionAccessService: ArchivedTransactionAccessService,
  ) { }

  @EventListener(BusinessEventsEnum.BusinessCreated)
  public async onBusinessCreated(business: BusinessModel): Promise<void>  {
    await this.archivedTransactionAccessService.createOrUpdateById(business);
  }

  @EventListener(BusinessEventsEnum.BusinessUpdated)
  public async onBusinessUpdated(business: BusinessModel): Promise<void>  {
    await this.archivedTransactionAccessService.createOrUpdateById(business);
  }

  @EventListener(BusinessEventsEnum.BusinessExport)
  public async onBusinessExport(business: BusinessModel): Promise<void>  {
    await this.archivedTransactionAccessService.createOrUpdateById(business);
  }
}
