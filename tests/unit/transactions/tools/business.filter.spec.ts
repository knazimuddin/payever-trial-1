import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { BusinessFilter } from '../../../../src/transactions/tools';
import * as uuid from 'uuid';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('BusinessFilter', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('apply()', () => {
    it('should apply the given business filter', async () => {
      
      const filter: any = {};
      const businessId: string = uuid.v4();
      const result: any = BusinessFilter.apply(businessId, filter);
      expect(result).to.deep.equal(
        { 
          business_uuid : [{
          condition: 'is',
          value: [businessId],
          }]
        },
      );
    });

    it('should apply the given business filter', async () => {
      
      const filter: any = undefined;
      const spy: sinon.SinonSpy = sandbox.spy(BusinessFilter.apply);
      try {
        BusinessFilter.apply(null, filter);
      } catch (e) { }
      expect(spy.threw());
    });
  });
});
