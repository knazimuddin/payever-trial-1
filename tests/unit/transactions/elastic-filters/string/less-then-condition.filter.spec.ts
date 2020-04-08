import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { StringFilterInterface } from '../../../../../src/transactions/elastic-filters/interfaces';
import { LessThenConditionFilter } from '../../../../../src/transactions/elastic-filters/string/less-then-condition.filter';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('LessThenConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        LessThenConditionFilter.getName(),
      ).to.equal('lessThan');
    });
  });

  describe('apply()', () => {
    it('should apply the given feild to elastic filter', async () => {
      const elasticFilters: any = {
        must: [],
        must_not: [],
      };
      const field: string = 'title';
      const _filter: StringFilterInterface = {
        value: [
          '123',
        ],
      }
      LessThenConditionFilter.apply(elasticFilters, field, _filter);
      expect(elasticFilters.must).to.deep.equal(
        [{
          range: {
            title: {
              lt: '123',
            },
          },
        }],
      );
    });
  });
});
