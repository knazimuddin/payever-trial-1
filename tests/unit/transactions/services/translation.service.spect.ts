import 'mocha';

import { TranslationService } from "../../../../src/transactions/services/translation.service";
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { IntercomService } from '@pe/nest-kit';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';


describe("TranslationService", () => {

    let sandbox: sinon.SinonSandbox;
    let translationService: TranslationService;
    let configService: ConfigService;
    let logger: Logger;
    let httpService: IntercomService;

    before(() => {
        httpService = {
            get: (): any => { },
        } as any;

        logger = {
            error: (error): any => { console.error(error) },
            log: (): any => { },
            warn: (data): any => { console.warn(data) },
        } as any;

        configService = {
            get: (): any => true,
        } as any;


        translationService = new TranslationService(configService, logger, httpService)
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        sandbox = undefined;
    });

    describe("translate()", () => {
        it("return array of translation", async () => {

            const getResponse: [] = {"actions.back": "Back", "actions.cancel": "Cancel" };

            const response: Observable<AxiosResponse<any>> = {
                pipe: (fn): any => { return fn() },
            } as any;

            const responseData: Observable<any> = {
                toPromise: (a): any => { return a },
            } as any;

            sandbox.stub(httpService, 'get').resolves(response);
            sandbox.stub(response, 'pipe').returns(responseData);
            sandbox.stub(responseData, 'toPromise').resolves(getResponse);

            var res = await translationService.getTranslation(["actions.back", "actions.cancel"], "en")
            expect(res).to.equal(getResponse)
        })
    })


})
