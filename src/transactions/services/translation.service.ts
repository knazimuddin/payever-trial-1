import { Injectable, Logger, HttpException } from '@nestjs/common';
import { IntercomService } from "@pe/nest-kit";
import { ConfigService } from "@nestjs/config";
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class TranslationService {

  private readonly translationUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
    private readonly httpService: IntercomService) {
      this.translationUrl = this.configService.get<string>("MICRO_Translation_Service");
    }

  public async translate(keys: string[], langCode: string): Promise<string[]> {
    return this.convert(keys, langCode);
  }

  private async convert(keys: string[], langCode: string): Promise<string[]> {
    const url = this.translationUrl.replace('{{lang}}', langCode);
    let result = [];
    let data = await this.httpService.get(url);

    return data.pipe(
      map(response => {
          const apiData = response.data;
          const result = [];

          if (!apiData) {
            this.logger.warn(`keys is empty`);
            return result;
          };

          keys.forEach(key => {
            result[key] = apiData[key] || key;
          });

          return result;
      }),
      catchError(err => {
          this.logger.error({
              error: err.response.data,
              message: 'Translate api failed',
              url: url,
          });
      })).toPromise();
  }


  // private async convert(keys: string[], langCode: string): Promise<string[]> {
  //   const url = `https://payeverstaging.azureedge.net/translations/frontend-transactions-app-${langCode}.json`;
  //   let result: string[] = [];
  //   return new Promise<string[]>((resolve, reject) => {
  //     this.httpService.get(url).subscribe(response => {
  //       if(response.status == 200){
  //         let data = response.data;
  //         for (let index = 0; index < keys.length; index++) {
  //           const key = keys[index];
  //           if(data[key])
  //             result.push(data[key]);
  //         }
  //         resolve(result);
  //       }
  //       else
  //         reject(response.statusText);
  //     });
  //   });

  // }

}
