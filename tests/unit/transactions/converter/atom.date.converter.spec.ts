import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { AtomDateConverter } from '../../../../src/transactions/converter';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('AtomDateConverter', () => {
  describe('fromAtomFormatToDate()', () => {
    it('should convert date string from atom format to Date', () => {
      expect(
        AtomDateConverter.fromAtomFormatToDate('2009-11-04T19:55:41Z+00:00').toISOString(),
      ).to.equal(new Date('2009-11-04T19:55:41.000Z').toISOString());
    });
  });

  describe('fromDateTotomFormat()', () => {
    it('should convert date object to atomFormat date', async () => {
      expect(
        AtomDateConverter.fromDateToAtomFormat(new Date('2009-11-04T18:55:41.000Z')),
      ).to.equal('2009-11-04T18:55:41+00:00');
    });
  });
});
