import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { IntercomService } from '@pe/nest-kit';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class TranslationService{
  private readonly translationServiceUrl: string;

  constructor(private readonly httpService: IntercomService,
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    ){
      this.translationServiceUrl = this.configService.get<string>('TRANSLATION_SERVICE_URL');
  }

  public async translate(keys:Array<string>, language:string):Promise<Array<{ title: string, name: string }>>{
    return await this.performTranslation(keys, language);
  }

  private async performTranslation(keys:Array<string>, language:string):Promise<Array<{ title: string, name: string }>>{
    const filteredKeys:Array<{ title: string, name: string }> = [];
    const translationServiceCompleteUrl:string = this.translationServiceUrl.concat(language,'.json');

    this.logger.log({
      message: 'Making backend translation service call',
      url: translationServiceCompleteUrl,
    });


    const response: Observable<any> = await this.httpService.get(translationServiceCompleteUrl);
    const translationData = response.pipe(
      map((res: any) => {return res.data; }),
      catchError((error) => {
        this.logger.error({
          error: error.response.data,
          message: 'Failed response frombackend translation service',
          url: translationServiceCompleteUrl,
        });
        return filteredKeys;
        //throw new HttpException(error.response.data.message, error.response.data.code);
      }),
    );

    let tempObj = JSON.parse(JSON.stringify(translationData));
    keys.forEach(function(t, index) {
      filteredKeys.push({'title':t,'name':tempObj[t]});
    });

    return filteredKeys;
  }
}
