import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { StringFilterInterface } from '../../../../../src/transactions/elastic-filters/interfaces';
import { BeforeDateConditionFilter } from '../../../../../src/transactions/mongo-filters/date/before-date-condition.filter';

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
    it('should apply the given feild to mongo filter', async () => {
      const mongoFilter: any = {
        $and: [],
        $or: [],
      }
      const field: string = 'startedAt';
      const _filter: StringFilterInterface = {
        value: [
          '2022-12-23',
        ],
      }
      BeforeDateConditionFilter.apply(mongoFilter, field, _filter);
      expect(mongoFilter.$and[0]).to.deep.equal(
        {
          startedAt: {
            $lt: 1671840000000,
          },
        },
      );
    });
  });
});
