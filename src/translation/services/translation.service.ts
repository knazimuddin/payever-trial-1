import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { environment } from '../../environments';
import { TranslatedObjectInterface, TranslatedPairInterface } from '../interfaces';
import { get } from 'https'

@Injectable()
export class TranslationService {
    constructor(
        private readonly logger: Logger) { }

    public async translate(keys: string[], language: string): Promise<TranslatedObjectInterface> {
        return await this.translateKeys(keys, language);
    }

    private async translateKeys(keys: string[], language: string): Promise<TranslatedObjectInterface> {
        // NOTE: I would use axios here (httpService.request(axiosRequestConfig)) but the test document refers to http client.
     
        return new Promise((resolve, reject) => {
            // TODO: I would pass domain as service or module parameter so this method gets really reusable.
            let apiURL = `${environment.frontendTranslationsUrl}/frontend-transactions-app-${language}.json`;
            
            get(apiURL, (res) => {
                if (res.statusCode !== 200) {
                    this.logger.error({
                        error: res.statusMessage,
                        errorStatus: res.statusCode,
                        message: 'Failed to get translation file.',
                        url: apiURL
                    });

                    res.resume();
                    reject(res.statusCode);
                }

                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('close', () => {
                    var translatedJson =  JSON.parse(data);
                    var translatedData = Object.entries(translatedJson).filter(k => keys.includes(k[0]));
                    var translated = translatedData.map(kv => ({ 'key': kv[0], 'text': kv[1] }) as TranslatedPairInterface);
                    // OR could be converted back to linear object Object.fromEntries()
                    return resolve(({'data': translated}));
                });
            })
            .on('error', err => {
                this.logger.error({
                    error: err.message,
                    errorStatus: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Failed to get translation file.',
                    url: apiURL
                });
            });;
        });
    }
}