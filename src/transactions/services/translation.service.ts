import {Injectable, Logger} from '@nestjs/common';
import {environment} from '../../environments';
import {get} from 'https';

@Injectable()
export class TranslationService {
  private keys: string[];
  private language: string;

  constructor(
    private readonly logger: Logger,
  ) {
  }

  public async do(keys: string[], language: string) {
    this.keys = keys;
    this.language = language;

    return await this.translate();
  }

  private async translate() {
    return new Promise((resolve, reject) => {
      let url = `${environment.translationService.baseUrl}/frontend-transactions-app-${this.language}.json`;
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
          let affectedTranslator = Object.entries(JSON.parse(data))
            .filter(key => this.keys.includes(key[0]))
            .map(key => ({'key': key[0], 'translated': key[1]}));

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
