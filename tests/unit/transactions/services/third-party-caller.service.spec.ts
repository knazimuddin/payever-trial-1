import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { catchError, map as MapStub } from 'rxjs/operators';

import { ThirdPartyCallerService, TransactionsService } from '../../../../src/transactions/services';
import { IntercomService } from '@pe/nest-kit';
import { Logger } from '@nestjs/common';
import { TransactionUnpackedDetailsInterface, ActionItemInterface } from '../../../../src/transactions/interfaces';
import { ActionPayloadInterface } from '../../../../src/transactions/interfaces/action-payload';
import { PaymentActionsEnum } from '../../../../src/transactions/enum';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('CurrencyExchangeService', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: ThirdPartyCallerService;
  let transactionsService: TransactionsService;
  let httpService: IntercomService;
  let logger: Logger;

  const transactionUnpackedDetails: TransactionUnpackedDetailsInterface = {
    id: '0dcb9da7-3836-44cf-83b1-9e6c091d15dc',
    history: [
      {
        action: 'action 1',
        amount: 12,
        created_at: new Date('2020-10-10'),
        payment_status: 'PAYMENT_ACCAPTED',
        params: {},
        reason: 'reason 1',
        is_restock_items: true,
        upload_items: [
          {},
        ],
        refund_items: [
          {},
        ],
      },
    ],
    original_id: 'beab4573-e69c-45e2-afc0-5487b9e670ec',
    type: 'santander_installment_dk',
    uuid: '9e90b7d9-1920-4e5a-ba5f-f5aebb382e10',
    billing_address: {},
    created_at: new Date('2020-10-10'),
    updated_at: new Date('2020-10-10'),
    action_running: true,
    amount: 123,
    business_option_id: 12345,
    business_uuid: 'd04c6e67-a824-47ef-957b-d4f0d6038ea1',
    channel: 'channel-1',
    channel_set_uuid: '7c969d07-fadd-486d-891f-e64eb6a2ce0b',
    channel_uuid: 'a306a777-20a4-4760-b0b7-4e6055b5cbcc',
    currency: 'EUR',
    customer_name: 'Narayan Ghimire',
    delivery_fee: 1.99,
    down_payment: 100,
    fee_accepted: true,
    items: [
      {
        _id: '714d74ad-f30c-4377-880f-50e30834a9da',
      },
    ],
    merchant_email: 'merchant1@payever.de',
    merchant_name: 'Gabriel Gabriel',
    payment_details: {
      iban: 'DE89 3704 0044 0532 0130 00',
    },
    payment_fee: 1.23,
    payment_flow_id: 'b2e14754-a931-433c-a9a8-3fdb32dfbf3e',
    place: 'Bremen',
    reference: 'reference_1',
    santander_applications: ['Application 1'],
    shipping_address: {
      city: 'Hamburg',
    },
    shipping_category: 'Category 1',
  } as TransactionUnpackedDetailsInterface;

  before(() => {
    transactionsService = {
      
    } as any;

    httpService = {
      post: (): any => { },
    } as any;

    logger = {
      error: (): any => { },
      log: (): any => { },
    } as any;

    testService = new ThirdPartyCallerService(transactionsService, httpService, logger);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('getActionsList()', () => {
    it('should return action list', async () => {
      
      const actionItems: ActionItemInterface[] = [
        {
          action: 'create',
          enabled: true,
        },
        {
          action: 'edit',
          enabled: false,
        },
      ];
      const actionsResponse: { [key: string]: boolean } = {
        create: true,
        edit: false,
      }

      let response: Observable<AxiosResponse<any>> = {
        pipe: (): any => { },
      } as any;
      let responseData: Observable<any> = {
        toPromise: (): any => { },
      } as any;
      sandbox.stub(httpService, 'post').resolves(response);
      sandbox.stub(response, 'pipe').returns(responseData);
      sandbox.stub(responseData, 'toPromise').resolves(actionsResponse);

      sandbox.stub(logger, 'log');
      sandbox.stub(logger, 'error');

      const result: ActionItemInterface[] = await testService.getActionsList(transactionUnpackedDetails);
      expect(result).to.deep.equal(actionItems);
      expect(logger.log).calledOnce;
    });

    it('should post throw error', async () => {
      sandbox.stub(httpService, 'post').throws({});
      
      sandbox.stub(logger, 'log');
      sandbox.stub(logger, 'error');

      expect(
        () => testService.getActionsList(transactionUnpackedDetails),
      ).to.throw;
    });

    it('should pipe throw error', async () => {
      let response: Observable<AxiosResponse<any>> = {
        pipe: (): any => { },
      } as any;

      sandbox.stub(httpService, 'post').resolves(response);
      sandbox.stub(response, 'pipe').throws({});
      
      sandbox.stub(logger, 'log');
      sandbox.stub(logger, 'error');

      expect(
        () => testService.getActionsList(transactionUnpackedDetails),
      ).to.throw;
    });

  });

  describe('runAction()', () => {
    const availableAction = [
      PaymentActionsEnum.Refund,
      PaymentActionsEnum.Authorize,
      PaymentActionsEnum.ShippingGoods,
    ];

    for (const actionName of availableAction) {
      it(`should send action if action name is ${actionName}`, async () => {
      const actionsResponse: { } = { };

      const actionPayload: ActionPayloadInterface = {
        paymentId: transactionUnpackedDetails.uuid,
      };

      let response: Observable<AxiosResponse<any>> = {
        pipe: (): any => { },
      } as any;
      let responseData: Observable<any> = {
        toPromise: (): any => { },
      } as any;

      sandbox.stub(httpService, 'post').resolves(response);
      sandbox.stub(response, 'pipe').returns(responseData);
      sandbox.stub(responseData, 'toPromise').resolves(actionsResponse);

      sandbox.stub(logger, 'log');
      sandbox.stub(logger, 'error');

      await testService.runAction(transactionUnpackedDetails, actionName, actionPayload);
      expect(logger.log).calledOnce;
    });
  }

  it('should run action throw error', async () => {
    const actionName = "throw-error";
    const actionPayload: ActionPayloadInterface = {
      paymentId: transactionUnpackedDetails.uuid,
    };

    const spy: sinon.SinonSpy = sandbox.spy(testService.runAction);
    try {
      await testService.runAction(transactionUnpackedDetails, actionName, actionPayload);
    } catch (e) { }
    expect(spy.threw());
  });

  });
});
