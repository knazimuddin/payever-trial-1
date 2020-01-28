import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';
import { Model } from 'mongoose';
import { PaymentFlowService } from '../../../../src/transactions/services/payment-flow.service';
import { PaymentFlowModel } from '../../../../src/transactions/models';
import { PaymentFlowDto } from '../../../../src/transactions/dto/checkout-rabbit';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('PaymentFlowService', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: PaymentFlowService;
  let paymentFlowModel: Model<PaymentFlowModel>;

  before(() => {
    paymentFlowModel = {
      create: (): any => { },
      findOne: (): any => { },
      findOneAndRemove: (): any => { },
      findOneAndUpdate: (): any => { },
    } as any;

    testService = new PaymentFlowService(paymentFlowModel);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('createOrUpdate()', () => {
    it('should update paymentFlowModel', async () => {
      const paymentFlow: PaymentFlowModel = {
        id: uuid.v4(),
      } as any;
      const flowDto: PaymentFlowDto = {
        id: uuid.v4(),
      } as any;

      sandbox.stub(paymentFlowModel, 'findOne').resolves(paymentFlow);
      sandbox.stub(paymentFlowModel, 'findOneAndUpdate');
      sandbox.stub(paymentFlowModel, 'create');

      await testService.createOrUpdate(flowDto);
      expect(paymentFlowModel.findOneAndUpdate).to.calledOnceWithExactly(
        { id: flowDto.id },
        flowDto,
        { new: true, upsert: true },
      );
    });
  });

  describe('findOneById()', () => {
    it('find paymentFlow by id', async () => {
      const paymentFlow: PaymentFlowModel = {
        id: uuid.v4(),
      } as any;
      sandbox.stub(paymentFlowModel, 'findOne').resolves(paymentFlow)
      expect(
        await testService.findOneById(paymentFlow.id),
      ).to.eq(paymentFlow);
    });
  });

  describe('removeById()', () => {
    it('find paymentFlow by id and remove', async () => {
      const paymentFlow: PaymentFlowModel = {
        id: uuid.v4(),
      } as any;
      sandbox.stub(paymentFlowModel, 'findOneAndRemove').resolves(paymentFlow)
      await testService.removeById(paymentFlow.id);
      expect(paymentFlowModel.findOneAndRemove).calledOnceWithExactly({ id: paymentFlow.id });
    });
  });
});
