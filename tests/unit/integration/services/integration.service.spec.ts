import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';
import { Model } from 'mongoose';

import { IntegrationService } from '../../../../src/integration/services';
import { IntegrationModel } from '../../../../src/integration/models';
import { FeaturesModel } from '../../../../src/integration/models/features.model';
import { CreateIntegrationDto } from '../../../../src/integration/dto';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('Integration Service', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: IntegrationService;
  let integrationModel: Model<IntegrationModel>;

  const integrationModelInstance: IntegrationModel = {
    _id: 'f5ea3ec2-1e00-48db-bcbb-72675ba07235',
    category: 'category 1',
    features: {} as FeaturesModel,
    name: 'Integration Name',
  } as any;

  before(() => {
    integrationModel = {
      create: (): any => { },
      find: (): any => { },
      findOne: (): any => { },
    } as any;
    testService = new IntegrationService(integrationModel);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  })

  describe('findAll()', () => {
    it('should return all the model instances', async () => {
      sandbox.stub(integrationModel, 'find').resolves([integrationModelInstance]);
      const result: IntegrationModel[] = await testService.findAll();
      expect(integrationModel.find).to.calledOnce;
      expect(result).to.deep.equal([integrationModelInstance]);
    });
  });

  describe('findOneById()', () => {
    it('should return an integration model instance by id', async () => {
      sandbox.stub(integrationModel, 'findOne').resolves(integrationModelInstance);
      const result: IntegrationModel = await testService.findOneById(integrationModelInstance._id);
      expect(result).to.eq(integrationModelInstance);
      expect(integrationModel.findOne).calledOnceWith({ _id: integrationModelInstance._id });
    });
  });

  describe('findOneByName()', () => {
    it('should return an integration model instance by name', async () => {
      sandbox.stub(integrationModel, 'findOne').resolves(integrationModelInstance);
      const result: IntegrationModel = await testService.findOneByName(integrationModelInstance.name);
      expect(result).to.eq(integrationModelInstance);
      expect(integrationModel.findOne).calledOnceWith({ name: integrationModelInstance.name });
    });
  });

  describe('create()', () => {
    it('should create a integration model', async () => {
      const data: CreateIntegrationDto = {
        category: "Integration Category",
        name: "Integration Name",
      }
      sandbox.stub(integrationModel, 'create').resolves(integrationModelInstance);
      const result: IntegrationModel = await testService.create(data);
      expect(result).to.equal(integrationModelInstance);
      expect(integrationModel.create).calledOnceWithExactly(data);
    })
  })
});
