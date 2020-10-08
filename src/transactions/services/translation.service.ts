import { Injectable, HttpService } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AxiosResponse } from 'axios';

@Injectable()
export class TranslationService {
    constructor(private httpService: HttpService) {}

    public async findTranslation(keys: string[], language: string) {
        return this.getTranslationFromBackend(keys, language).then(res => {
            return res;
        });
    }

    private async getTranslationFromBackend(keys: string[], language: string) {
        const url =
            'https://translation-backend.staging.devpayever.com/json/frontend-transactions-app-' +
            language +
            '.json';
        const response: Observable<AxiosResponse<any>> = await this.httpService.get(
            url,
        );

        return response
            .pipe(
            map((res: any) => {
                const translations = res.data;
                return Object.keys(translations)
                .filter(key => keys.includes(key))
                .reduce((obj, key) => {
                    obj[key] = translations[key];
                    return obj;
                }, {});
            }),
            )
            .toPromise();
    }

}
