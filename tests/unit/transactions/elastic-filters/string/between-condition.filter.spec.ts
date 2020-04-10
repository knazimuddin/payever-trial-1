import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import {
  BetweenConditionFilter,
} from '../../../../../src/transactions/elastic-filters/string/between-condition.filter';
import { BetweenFilterInterface } from '../../../../../src/transactions/elastic-filters/interfaces/between-filter.interface';

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
    it('should apply the given feild to elastic filter', async () => {
      const elasticFilters: any = {
        must: [],
        must_not: [],
      };
      const field: string = 'shipping_cost';
      const _filter: BetweenFilterInterface = {
        value: [
          {
            from: '20',
            to: '30',
          },
        ],
      }
      BetweenConditionFilter.apply(elasticFilters, field, _filter);
      expect(elasticFilters.must).to.deep.equal(
        [{
          range: {
            shipping_cost: { gte: 20, lte: 30 },
          },
        }],
      );
    });
  });
});
