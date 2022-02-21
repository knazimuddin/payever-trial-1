import { Injectable, Logger, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class TranslationService {

  constructor(private httpService: HttpService) {}

  public async translate(keys: string[], langCode: string): Promise<string[]> {
    return this.convert(keys, langCode);
  }

  private async convert(keys: string[], langCode: string): Promise<string[]> {
    const url = `https://payeverstaging.azureedge.net/translations/frontend-transactions-app-${langCode}.json`;
    let result: string[] = [];
    return new Promise<string[]>((resolve, reject) => {
      this.httpService.get(url).subscribe(response => {
        if(response.status == 200){
          let data = response.data;
          for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            if(data[key])
              result.push(data[key]);
          }
          resolve(result);
        }
        else
          reject(response.statusText);
      });
    });

  }

}
