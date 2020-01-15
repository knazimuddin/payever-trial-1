import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';
import { Model } from 'mongoose';

import { BusinessService } from '../../../../src/transactions/services/business.service';
import { BusinessModel } from '../../../../src/transactions/models';
import { BusinessDto } from '../../../../src/transactions/dto';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('Business Service', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: BusinessService;
  let businessModel: Model<BusinessModel>;

  const businessModelInstance: BusinessModel = {
    _id: uuid.v4(),
    currency: 'EUR',
  } as any;

  before(() => {
    businessModel = {
      deleteOne: (): any => { },
      findOne: (): any => { },
      findOneAndUpdate: (): any => { },
    } as any;

    testService = new BusinessService(businessModel);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('save()', () => {
    it('find a business and update', async () => {
      const dto: BusinessDto = {
        _id: businessModelInstance._id,
        currency: 'EUR',
      } as any;

      sandbox.stub(businessModel, 'findOneAndUpdate').resolves(businessModelInstance);
      const result: BusinessModel = await testService.save(dto);
      expect(result).to.eq(businessModelInstance);
    });
  });

  describe('getBusinessById()', () => {
    it('returns business with matching id', async () => {
      sandbox.stub(businessModel, 'findOne').resolves(businessModelInstance);
      const result: BusinessModel = await testService.getBusinessById(businessModelInstance._id);
      expect(result).to.equal(businessModelInstance);
    });
  });

  describe('deleteOneById()', () => {
    it('delete business by id', async () => {
      sandbox.stub(businessModel, 'deleteOne');
      await testService.deleteOneById(uuid.v4());
    });
  });
});
