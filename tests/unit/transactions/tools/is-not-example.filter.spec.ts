import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { IsNotExampleFilter } from '../../../../src/transactions/tools';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('IsNotExampleFilter', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });
  
  describe('apply()', () => {
    it('should apply the given is not example filter', async () => {
      
      const filter: any = {};
      const result: any = IsNotExampleFilter.apply(filter);
      expect(result).to.deep.equal(
        { 
          example : [{
          condition: 'isNot',
          value: [true],
          }]
        },
      );
    });

    it('should apply the given is not example filter', async () => {
      
      const filter: any = undefined;
      const spy: sinon.SinonSpy = sandbox.spy(IsNotExampleFilter.apply);
      try {
        IsNotExampleFilter.apply(filter);
      } catch (e) { }
      expect(spy.threw());
    });
  });
});
