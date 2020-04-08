import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { UserFilter } from '../../../../src/transactions/tools';
import * as uuid from 'uuid';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('UserFilter', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });
  
  describe('apply()', () => {
    it('should apply the given user filter', async () => {
      
      const filter: any = {};
      const userId: string = uuid.v4();
      const result: any = UserFilter.apply(userId, filter);
      expect(result).to.deep.equal(
        { 
          user_uuid : [{
          condition: 'is',
          value: [userId],
          }]
        },
      );
    });

    it('should apply the given user filter', async () => {
      
      const filter: any = undefined;
      const spy: sinon.SinonSpy = sandbox.spy(UserFilter.apply);
      try {
        UserFilter.apply(null, filter);
      } catch (e) { }
      expect(spy.threw());
    });
  });
});
