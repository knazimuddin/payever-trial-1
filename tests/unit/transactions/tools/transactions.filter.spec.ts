import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { TransactionsFilter } from '../../../../src/transactions/tools';
import * as uuid from 'uuid';
import { ScopeEnum } from '@pe/folders-plugin';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('TransactionsFilter', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('applyBusinessFilter()', () => {
    it('should apply the given business filter', async () => {

      const filter: any = { };
      const businessId: string = uuid.v4();
      const result: any = TransactionsFilter.applyBusinessFilter(businessId, filter);
      expect(result).to.deep.equal(
        {
          business_uuid : [{
          condition: 'is',
          value: [businessId],
          }],
        },
      );
    });

    it('should apply the given business filter with scope', async () => {
      const filter: any = { };
      const businessId: string = uuid.v4();
      const result: any = TransactionsFilter.applyBusinessFilter(businessId, filter, true);
      expect(result).to.deep.equal(
        {
          business_uuid : [{
            condition: 'is',
            value: [businessId],
          }],
          scope : [{
            condition: 'is',
            value: [ScopeEnum.Business],
          }],
        },
      );
    });

    it('should apply the given business filter', async () => {

      const filter: any = undefined;
      const spy: sinon.SinonSpy = sandbox.spy(TransactionsFilter.applyBusinessFilter);
      try {
        TransactionsFilter.applyBusinessFilter(null, filter);
      } catch (e) { }
      expect(spy.threw());
    });
  });

  describe('applyUserUuidFilter()', () => {
    it('should apply the given user filter', async () => {

      const filter: any = { };
      const userId: string = uuid.v4();
      const result: any = TransactionsFilter.applyUserUuidFilter(userId, filter);
      expect(result).to.deep.equal(
        {
          user_uuid : [{
            condition: 'is',
            value: [userId],
          }],
        },
      );
    });

    it('should apply the given user filter', async () => {

      const filter: any = undefined;
      const spy: sinon.SinonSpy = sandbox.spy(TransactionsFilter.applyUserUuidFilter);
      try {
        TransactionsFilter.applyUserUuidFilter(null, filter);
      } catch (e) { }
      expect(spy.threw());
    });
  });

  describe('applyUserIdFilter()', () => {
    it('should apply the given user filter', async () => {

      const filter: any = { };
      const userId: string = uuid.v4();
      const result: any = TransactionsFilter.applyUserIdFilter(userId, filter);
      expect(result).to.deep.equal(
        {
          userId : [{
            condition: 'is',
            value: [userId],
          }],
        },
      );
    });

    it('should apply the given user filter with scope', async () => {

      const filter: any = { };
      const userId: string = uuid.v4();
      const result: any = TransactionsFilter.applyUserIdFilter(userId, filter, true);
      expect(result).to.deep.equal(
        {
          scope : [{
            condition: 'is',
            value: [ScopeEnum.User],
          }],
          userId : [{
            condition: 'is',
            value: [userId],
          }],
        },
      );
    });

    it('should apply the given user filter', async () => {

      const filter: any = undefined;
      const spy: sinon.SinonSpy = sandbox.spy(TransactionsFilter.applyUserIdFilter);
      try {
        TransactionsFilter.applyUserIdFilter(null, filter);
      } catch (e) { }
      expect(spy.threw());
    });
  });

});
