import { Injectable, Logger, HttpException } from '@nestjs/common'
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { Observable } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { HttpService } from '@nestjs/common'

const BASE_URL = 'https://payeverstaging.azureedge.net'

@Injectable()
export class TranslationService {
  // TODO: redis should be used
  private cache: object

  constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService
  ) {
    this.cache = {}
  }

  public async translate(language: string, keys: string[]): Promise<object> {
    // TODO: available languages should be validated here

    return await this.fetchTranslation(language, keys)
  }

  private async fetchTranslation(
    language: string,
    keys: string[]
  ): Promise<any> {
    const filename = `frontend-transactions-app-${language}.json`
    const filterKeys = data => {
      this.cache[filename] = data

      const result = {}
      for (const key of keys) {
        if (key in data) result[key] = data[key]
      }
      return result
    }

    if (filename in this.cache) return filterKeys(this.cache[filename])

    const url = `${BASE_URL}/translations/${filename}`
    const response: Observable<AxiosResponse<any>> = await this.httpService.get(
      url
    )

    return response
      .pipe(
        map((res: any) => {
          this.logger.log({
            message: 'Received translation file',
            language,
            url
          })

          return filterKeys(res.data)
        }),
        catchError((error: AxiosError) => {
          this.logger.error({
            error,
            message: 'Failed to fetch translation file',
            language,
            url
          })

          throw new HttpException('Failed to fetch transaction file', 404)
        })
      )
      .toPromise()
  }
}
