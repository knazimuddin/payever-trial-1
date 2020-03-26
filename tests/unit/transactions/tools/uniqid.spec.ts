import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { Uniqid } from '../../../../src/transactions/tools';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('Uniqid', () => {
  
  describe('generate()', () => {
    it('should generate the uniqid without entropy', async () => {
      
      const result:string = Uniqid.generate("test", false);
      expect(result).to.contains("test");
    });

    it('should generate the uniqid with entropy', async () => {
      
      const result:string = Uniqid.generate("test", true);
      expect(result).to.contains("test");
    });

    it('should generate the uniqid wrong', async () => {
      
      const result:string = Uniqid.generate("test", false);
      expect(result).to.not.equal("testXXXX");
    });
  });
});
