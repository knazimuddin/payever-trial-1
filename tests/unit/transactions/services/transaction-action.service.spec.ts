import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Logger } from '@nestjs/common';
import { TransactionActionService } from '../../../../src/transactions/services/transaction-action.service';
import { TransactionsService } from '../../../../src/transactions/services/transactions.service';
import { DtoValidationService } from '../../../../src/transactions/services/dto-validation.service';
import { MessagingService } from '../../../../src/transactions/services/messaging.service';
import { TransactionsExampleService } from '../../../../src/transactions/services/transactions-example.service';
import { ActionPayloadDto } from '../../../../src/transactions/dto/action-payload';
import { TransactionModel } from '../../../../src/transactions/models';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('TransactonActionService()', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: TransactionActionService;
  let transactionsService: TransactionsService;
  let dtoValidation: DtoValidationService;
  let messagingService: MessagingService;
  let logger: Logger;
  let exampleService: TransactionsExampleService;

  before(() => {
    transactionsService = {
      findUnpackedByUuid: (): any => { },
    } as any;

    dtoValidation = {
      checkFileUploadDto: (): any => { },
    } as any;

    messagingService = {
      runAction: (): any => { },
      sendTransactionUpdate: (): any => { },
    } as any;

    logger = {
      log: (): any => { },
    } as any;

    exampleService = {
      refundExample: (): any => { },
    } as any;

    testService = new TransactionActionService(
      transactionsService,
      dtoValidation,
      messagingService,
      logger,
      exampleService,
    );
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('doAction()', () => {
    it('should perform action successfully', async () => {
      const transaction: TransactionModel = {
        toObject(): any { return this },
      } as any;
      const actionPayload: ActionPayloadDto = {} as any;

      await testService.doAction(transaction, actionPayload, 'action');
    });

    it('should throw error while performing action', async () => {
      const transaction: TransactionModel = {
        toObject(): any { return this },
      } as any;
      const actionPayload: ActionPayloadDto = {} as any;
      sandbox.stub(messagingService, 'runAction').throws({
        message: 'Error Occured',
      })
      const spy: sinon.SinonSpy = sandbox.spy(testService.doAction);
      try {
        await testService.doAction(transaction, actionPayload, 'action');
      } catch (e) { }
      expect(spy.threw());
    });

    it('should throw error while performing action', async () => {
      const transaction: TransactionModel = {
        toObject(): any { return this },
      } as any;
      const actionPayload: ActionPayloadDto = {} as any;
      sandbox.stub(messagingService, 'sendTransactionUpdate').throws(Error('new Error'))
      const spy: sinon.SinonSpy = sandbox.spy(testService.doAction);
      try {
        await testService.doAction(transaction, actionPayload, 'action');
      } catch (e) { }
      expect(spy.threw());
    });

  });

  describe('doFakeAction()', () => {
    it('should do fake actions for shipping_goods', async () => {
      const transaction: TransactionModel = {
        billing_address: {
          id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        },
        save(): any { },
      } as any;
      const actionPayload: ActionPayloadDto = {} as any;
      await testService.doFakeAction(transaction, actionPayload, 'shipping_goods');
    });
    it('should do fake actions for shipping_goods', async () => {
      const transaction: TransactionModel = {
        billing_address: {},
        save(): any { },
      } as any;
      const actionPayload: ActionPayloadDto = {} as any;
      await testService.doFakeAction(transaction, actionPayload, 'shipping_goods');
    });

    it('should do fake actions for shipping_goods', async () => {
      const transaction: TransactionModel = {
        billing_address: {},
        save(): any { },
      } as any;
      const actionPayload: ActionPayloadDto = {
        fields: {
          payment_return: {},
        },
      } as any;
      await testService.doFakeAction(transaction, actionPayload, 'refund');
    });

    it('should do fake actions for shipping_goods', async () => {
      const transaction: TransactionModel = {
        billing_address: {},
        save(): any { },
      } as any;
      const actionPayload: ActionPayloadDto = {} as any;
      await testService.doFakeAction(transaction, actionPayload, 'cancel');
    });

  });
});
