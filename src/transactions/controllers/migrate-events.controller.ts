import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { snakeCase } from 'lodash';
import { Observable, of } from 'rxjs';
import { map, tap, timeout, catchError, take } from 'rxjs/operators';

import { MessageBusService } from '@pe/nest-kit/modules/message';
import { ActionPayloadDto } from '../dto';

import { TransactionsService, MessagingService } from '../services';
import { environment } from '../../environments';

@Controller()
export class MigrateEventsController {

  private messageBusService: MessageBusService = new MessageBusService({
    rsa: environment.rsa,
  });

  constructor(private readonly transactionsService: TransactionsService) {
  }

  @MessagePattern({
    channel: 'async_events_transactions_micro',
    name: 'payever.event.payment.migrate',
    origin: 'rabbitmq',
  })
  async onActionMigrateEvent(msg: any) {
    const data = this.messageBusService.unwrapMessage(msg.data);
    console.log('ACTION.MIGRATE!', data.payment);
    const transaction: any = data.payment;
    this.transactionsService.prepareTransactionForInsert(transaction);
    this.transactionsService.createOrUpdate(transaction);
  }

  // private prepareTransactionForInsert(transaction) {
    // transaction.billing_address = transaction.address;
    // transaction.original_id = transaction.id;
    // transaction.type = transaction.payment_type;
    // transaction.payment_details = JSON.stringify(transaction.payment_details);

    // if (transaction.business) {
      // transaction.business_uuid = transaction.business.uuid;
      // transaction.merchant_name = transaction.business.company_name;
      // transaction.merchant_email = transaction.business.company_email;
    // }

    // if (transaction.history && transaction.history.length) {
      // const updatedHistory = transaction.history.map((historyItem) => {
        // return this.prepareTransactionHistoryItemForInsert(historyItem);
      // });
    // }
  // }

  // private prepareTransactionHistoryItemForInsert(data) {
    // return {
      // ...data.data,
      // action: data.history_type,
      // created_at: Date.now(),
      // is_restock_items: data.items_restocked,
    // };
  // }

}
