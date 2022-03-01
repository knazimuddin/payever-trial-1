import {Injectable, Logger} from '@nestjs/common';
import {environment} from '../../environments';
import {get} from 'https';

@Injectable()
export class TranslationService {
  private keys: string[];
  private language: string;
  private package: string;

  constructor(
    private readonly logger: Logger,
  ) {
  }

  public async do(keys: string[], language: string) {
    this.keys = keys;
    this.language = language;

    return await this.translate();
  }

  public setPackage(languagePackage) {
    this.package = languagePackage;

    return this;
  }

  private async translate() {
    return new Promise((resolve, reject) => {
      let url = `${environment.translationService.baseUrl}/${this.package}-${this.language}.json`;
      get(url, (response) => {
        if (response.statusCode !== 200) {
          this.logger.log({
            data: response.statusMessage,
            message: 'Failed response from media call',
            url: url,
          });
          response.resume();
          reject(response.statusCode);
        }
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('close', () => {
          data = JSON.parse(data);
          let affectedTranslator = Object.entries(this.keys)
            .map(function (key){

              return data[key[1]] ?? key[1];
            });

          return resolve((affectedTranslator));
        });
      }).on('error', error => {
        this.logger.log({
          data: error.message,
          message: 'Failed response from media call',
          url: url,
        });
      });
    });
  }
}
