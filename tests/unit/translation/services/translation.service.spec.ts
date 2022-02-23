import { Logger } from '@nestjs/common';
import { TranslationService } from '../../../../src/translation/services'
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import 'mocha';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('TranslationService', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: TranslationService;
  let logger: Logger;
  let keysToTranslate : string[];

  before(() => {

    logger = {
      error: (): any => { },
      log: (): any => { },
    } as any;

    keysToTranslate = ["actions.back", "actions.back_to", "welcome.title"]
      
    testService = new TranslationService(logger);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('translate()', () => {
    it('should translate provided keys into provided language', async () => {
      var translated = await testService.translate(keysToTranslate, 'en');
      var translatedKeys = translated.data.map(kv => kv.key);
      console.log(translatedKeys)
      expect(
        translatedKeys // Sorting both to garantee the match? 
      ).to.eql(keysToTranslate);
    });
  });
});
