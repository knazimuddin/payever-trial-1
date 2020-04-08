import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Logger } from '@nestjs/common';
import { ActionsRetriever } from '../../../../src/transactions/services/actions.retriever';
import { MessagingService } from '../../../../src/transactions/services/messaging.service';
import { ThirdPartyCallerService } from '../../../../src/transactions/services/third-party-caller.service';
import { ActionItemInterface } from '../../../../src/transactions/interfaces';
import { TransactionUnpackedDetailsInterface } from '../../../../src/transactions/interfaces/transaction';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('ActionRetriver', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: ActionsRetriever;
  let messagingService: MessagingService;
  let thirdPartyCallerService: ThirdPartyCallerService;
  let logger: Logger;

  const actions: ActionItemInterface[] = [
    {
      action: 'Action 1',
      enabled: true,
    },
    {
      action: 'Action 2',
      enabled: false,
    },
  ]

  before(() => {
    messagingService = {
      getActionsList: (): any => { },
    } as any;

    logger = {
      error: (): any => { },
    } as any;

    testService = new ActionsRetriever(messagingService, thirdPartyCallerService, logger);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('retrive()', () => {
    it('should retrieve actions', async () => {
      sandbox.stub(messagingService, 'getActionsList').resolves(actions)
      const result: ActionItemInterface[] = await testService.retrieve({} as any);
      expect(result).to.eq(actions);
    });

    it('should retrieve actions type instant_payment', async () => {
      sandbox.stub(messagingService, 'getActionsList').resolves(actions)
      const result: ActionItemInterface[] = await testService.retrieve({type:'instant_payment'} as any);
      expect(result).to.deep.eq([]);
    });

    it('should return 0 actions when messaging service throws error', async () => {
      sandbox.stub(messagingService, 'getActionsList').throws({
        message: 'error occured',
        stack: 'stract trace fake',
      });
      expect(
        await testService.retrieve({} as any),
      ).to.throw;
    });
  });

  describe('retrieveFakeActions() for STATUS_ACCEPTED', () => {
    it('should retrieve fake  actions', async () => {
      const unpackaedTransaction: TransactionUnpackedDetailsInterface = {
        status: 'STATUS_ACCEPTED',
      } as any;
      const actionItem: ActionItemInterface[] = testService.retrieveFakeActions(unpackaedTransaction);
      expect(actionItem).to.deep.eq([
        {
          action: 'refund',
          enabled: true,
        },
        {
          action: 'cancel',
          enabled: true,
        },
        {
          action: 'shipping_goods',
          enabled: true,
        },
      ]);
    });
  });

  it('should retrive fake actions for STATUS_PAID', async () => {
    const unpackaedTransaction: TransactionUnpackedDetailsInterface = {
      status: 'STATUS_PAID',
    } as any;
    expect(
      testService.retrieveFakeActions(unpackaedTransaction),
    ).to.deep.eq([])
  });
  it('should retrive fake actions for UNKNOWN_STATUS', async () => {
    const unpackaedTransaction: TransactionUnpackedDetailsInterface = {
      status: 'UNKNOWN_STATUS',
    } as any;
    expect(
      testService.retrieveFakeActions(unpackaedTransaction),
    ).to.deep.eq([])
  });

});
