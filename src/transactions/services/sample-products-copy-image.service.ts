import { HttpService, Injectable, Logger } from '@nestjs/common';
import { environment } from '../../environments';
import * as FormData from 'form-data';

@Injectable()
export class SampleProductCopyImageService {
  constructor(private readonly logger: Logger, private readonly httpService: HttpService) {}

  /* istanbul ignore next */
  public async importImages(images: string[], businessUuid: string, throwException: Boolean = true): Promise<string[]> {
    if (!(images instanceof Array)) {
      return [];
    }

    return Promise.all(
      images.map(async imageUrl => {
        return this.pipeImageToPayever(imageUrl, businessUuid, throwException);
      }),
    );
  }

  private async pipeImageToPayever(imageUrl: string, businessUuid: string, throwException: Boolean): Promise<string> {
    /* istanbul ignore next */
    try {
      const res = await this.httpService.get(imageUrl, { responseType: 'arraybuffer' }).toPromise();

      const form: any = new FormData();
      form.append('file', res.data, 'products');

      const uploadResponse: any = await this.httpService
        .post(`${environment.microUrlMedia}/api/image/business/${businessUuid}/products`, form, {
          headers: {
            'Content-Length': form.getLengthSync(),
            ...form.getHeaders(),
          },
        })
        .toPromise();

      return uploadResponse.data.blobName;
    } catch (e) {
      this.logger.error({
        message: `Failed downloading image: ${imageUrl}, businessUuid: ${businessUuid}, 
        post image: ${environment.microUrlMedia}/api/image/business/${businessUuid}/products`,
        e,
        context: 'SampleProductCopyImageService',
      });

      if (throwException) {
        throw new Error(`Failed downloading image: ${imageUrl}`);
      }
      return '';
    }
  }
}
