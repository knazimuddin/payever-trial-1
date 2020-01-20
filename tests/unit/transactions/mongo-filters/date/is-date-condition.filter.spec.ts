import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { StringFilterInterface } from '../../../../../src/transactions/mongo-filters/interfaces';
import { IsDateConditionFilter } from '../../../../../src/transactions/mongo-filters/date/is-date-condition.filter';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('IsDateConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        IsDateConditionFilter.getName(),
      ).to.equal('isDate');
    });
  });

  describe('apply()', () => {
    it('should apply the given feild to mongo filter', async () => {
      const mongoFilters: any = {
        $and: [],
        $not: [],
      };
      const field: string = 'startedAt';
      const _filter: StringFilterInterface = {
        value: [
          '2022-01-23',
        ],
      }
      IsDateConditionFilter.apply(mongoFilters, field, _filter);
      expect(mongoFilters.$and[0]).to.deep.equal(
        {
          startedAt: {
            $gte: "2022-01-23T00:00:00.000Z", $lt: "2022-01-24T00:00:00.000Z",
          },
        },
      );
    });
  });
});
