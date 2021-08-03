import { Injectable } from '@nestjs/common';
import { EventListener } from '@pe/nest-kit';
import { BusinessModel, BusinessEventsEnum } from '@pe/business-kit';
import {  TransactionsExampleService } from '../services';

@Injectable()
export class BusinessEventListener {
  constructor(
    private readonly exampleService: TransactionsExampleService,
  ) { }
  
  @EventListener(BusinessEventsEnum.BusinessRemoved)
  public async onBusinessRemoved(business: BusinessModel): Promise<void>  {
    await this.exampleService.removeBusinessExamples(business._id);
  }
}
