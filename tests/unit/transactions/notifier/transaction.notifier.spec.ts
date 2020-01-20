import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';
import { TransactionsNotifier } from '../../../../src/transactions/notifiers';
import { NotificationsEmitter } from '@pe/notifications-sdk';
import { TransactionModel } from '../../../../src/transactions/models';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('TransactionsNoifier', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: TransactionsNotifier;
  let notificationsEmitter: NotificationsEmitter;

  const transaction: TransactionModel = {
    business_uuid: uuid.v4(),
    uuid: uuid.v4(),
  } as any;

  before(() => {
    notificationsEmitter = {
      cancelNotification: (): any => { },
      sendNotification: (): any => { },
    } as any;

    testService = new TransactionsNotifier(notificationsEmitter);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('should send Notification', () => {
    it('should send a notification', async () => {
      sandbox.stub(notificationsEmitter, 'sendNotification');
      await testService.sendNewTransactionNotification(transaction);
      expect(notificationsEmitter.sendNotification).to.be.calledWithExactly(
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
    });
  });

  describe('cancelNewTransactionNotification', () => {
    it('should  cancel new transaction notification', async () => {
      sandbox.stub(notificationsEmitter, 'cancelNotification');
      await testService.cancelNewTransactionNotification(transaction);
      expect(notificationsEmitter.cancelNotification).to.be.calledWithExactly(
        {
          app: 'transactions',
          entity: transaction.business_uuid,
          kind: 'business',
        },
        `notification.transactions.title.new_transaction`,
        {
          transactionId: transaction.uuid,
        },
      )
    });
  });
});
