import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { DtoValidationService } from '../../../../src/transactions/services/dto-validation.service';
import { ActionPayloadDto } from '../../../../src/transactions/dto/action-payload';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('DtoValidationService', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: DtoValidationService;

  before(() => {
    testService = new DtoValidationService();
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('checkFileUploadDto()', () => {
    it('should check file dto', async () => {
      const dto: ActionPayloadDto = {
        files: [
          {
            url: 'www.payever.de/files',
          },
        ],
      } as ActionPayloadDto;
      testService.checkFileUploadDto(dto);
      expect(dto).to.deep.equal({
        files: [
          {
            url: 'www.payever.de/files',
          },
        ],
      })
    });
    it('should check file dto with space in url', async () => {
      const dto: ActionPayloadDto = {
        files: [
          {
            url: 'www.payever.de/ files',
          } as any,
        ],
      } as ActionPayloadDto;
      testService.checkFileUploadDto(dto),
        expect(dto).to.deep.eq({
          files: [
            {
              url: 'www.payever.de/%20files',
            },
          ],
        })
      testService.checkFileUploadDto(dto);
    });
    it('should check file dto with no files', async () => {
      const dto: ActionPayloadDto = {
        files: undefined,
      } as ActionPayloadDto;
      testService.checkFileUploadDto(dto);
      expect(dto).to.deep.eq({ files: undefined });
    });
  });
});
