import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { StringFilterInterface } from '../../../../../src/transactions/elastic-filters/interfaces';
import { BeforeDateConditionFilter } from '../../../../../src/transactions/elastic-filters/date/before-date-condition.filter';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('BeforeDateConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        BeforeDateConditionFilter.getName(),
      ).to.equal('beforeDate');
    });
  });

  describe('apply()', () => {
    it('should apply the given feild to elastic filter', async () => {
      const elasticFilters: any = {
        must: [],
      };
      const field: string = 'startedAt';
      const _filter: StringFilterInterface = {
        value: [
          new Date().toString(),
        ],
      }
      BeforeDateConditionFilter.apply(elasticFilters, field, _filter);
      expect(elasticFilters.must.length).to.be.greaterThan(0);
    });
  });
});
