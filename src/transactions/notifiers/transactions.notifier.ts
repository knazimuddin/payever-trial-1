import { InjectNotificationsEmitter, NotificationsEmitter } from '@pe/notifications-sdk';
import { TransactionModel } from '../models';

export class TransactionsNotifier {
  constructor(
    @InjectNotificationsEmitter() private readonly notificationsEmitter: NotificationsEmitter,
  ) { }

  public async sendNewTransactionNotification(transaction: TransactionModel): Promise<void> {
    await this.notificationsEmitter.sendNotification(
      {
        app: 'transactions',
        entity: transaction.business_uuid,
        kind: 'business',
      },
      `notification.transactions.title.new_transaction`,
      {
        transaction: transaction,
        transactionId: transaction.uuid,
      },
    );
  }

  public async cancelNewTransactionNotification(transaction: TransactionModel): Promise<void> {
    await this.notificationsEmitter.cancelNotification(
      {
        app: 'transactions',
        entity: transaction.business_uuid,
        kind: 'business',
      },
      `notification.transactions.title.new_transaction`,
      {
        transactionId: transaction.uuid,
      },
    );
  }
}
