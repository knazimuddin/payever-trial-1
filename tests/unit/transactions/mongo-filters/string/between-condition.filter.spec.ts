import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { BetweenFilterInterface } from '../../../../../src/transactions/mongo-filters/interfaces';
import { BetweenConditionFilter } from '../../../../../src/transactions/mongo-filters/string/between-condition.filter';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('BetweenConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        BetweenConditionFilter.getName(),
      ).to.equal('between');
    });
  });

  describe('apply()', () => {
    it('should apply the given feild to mongo filter', async () => {
      const mongoFilters: any = {
        $and: [],
        $not: [],
      }
      const field: string = 'shipping_cost';
      const _filter: BetweenFilterInterface = {
        value: [
          {
            from: '20',
            to: '30',
          },
        ],
      }
      BetweenConditionFilter.apply(mongoFilters, field, _filter);
      expect(mongoFilters.$and).to.deep.equal(
        [{
          shipping_cost: { $gte: 20, $lte: 30 },
        }],
      );
    });
  });
});
