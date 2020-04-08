import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { BusinessPaymentOptionModel } from '../../../../src/transactions/models';
import { BusinessPaymentOptionService } from '../../../../src/transactions/services/business-payment-option.service';
import { BusinessPaymentOptionInterface } from '../../../../src/transactions/interfaces';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('BusinessPaymentOption', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: BusinessPaymentOptionService;
  let businessPaymentModel: Model<BusinessPaymentOptionModel>;
  let logger: Logger;

  before(() => {
    businessPaymentModel = {
      findOne: (): any => { },
      updateOne: (): any => { },
    } as any;
    logger = {
      log: (): any => { },
      warn: (): any => { },
    } as any;

    testService = new BusinessPaymentOptionService(
      businessPaymentModel,
      logger,
    )

  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('createOrUpdate()', async () => {
    it('should create or update business payment model', async () => {
      const dto: BusinessPaymentOptionInterface = {
        credentials: [],
        options: '{}',
      } as BusinessPaymentOptionInterface;

      const bpo: BusinessPaymentOptionModel = {
        id: 12345678,
        toObject(): any {
          return this;
        },
        options: '{}',
      } as BusinessPaymentOptionModel;

      sandbox.stub(businessPaymentModel, 'updateOne');
      sandbox.stub(businessPaymentModel, 'findOne').resolves(bpo)
      expect(
        await testService.createOrUpdate(dto),
      ).to.eq(
        bpo,
      )
    });

    it('should create or update business payment model with illigal character in options', async () => {
      const dto: BusinessPaymentOptionInterface = {
        credentials: {},
        options: {
          bigInt: BigInt(9007199254740991),
        },
      } as any;

      const bpo: BusinessPaymentOptionModel = {
        id: 12345678,
        toObject(): any {
          return this;
        },
        options: '{{',
      } as any;

      sandbox.stub(businessPaymentModel, 'updateOne');
      sandbox.stub(businessPaymentModel, 'findOne').resolves(bpo)
      sandbox.spy(logger, 'warn');
      expect(
        await testService.createOrUpdate(dto),
      ).to.eq(bpo);

      expect(logger.warn).calledTwice;

    });

    it('should create or update business payment model with no \'options\'', async () => {
      const dto: BusinessPaymentOptionInterface = {
        credentials: [],
      } as any;

      const bpo: BusinessPaymentOptionModel = {
        id: 12345678,
        toObject(): any {
          return this;
        },
      } as BusinessPaymentOptionModel;

      sandbox.stub(businessPaymentModel, 'updateOne');
      sandbox.stub(businessPaymentModel, 'findOne').resolves(bpo)
      expect(
        await testService.createOrUpdate(dto),
      ).to.deep.equal(
        bpo,
      );
    });

  });

  describe('findOneById()', async () => {
    it('should find businessPaymentOptionModel by id', async () => {
      sandbox.stub(businessPaymentModel, 'findOne').resolves(null);
      expect(
        await testService.findOneById(123),
      ).to.eq(null);
    });
  });
});
