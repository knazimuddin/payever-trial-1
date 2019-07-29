import { Injectable } from '@nestjs/common';
import { ActionPayloadDto } from '../dto/action-payload';

@Injectable()
export class DtoValidationService {
  /**
   * Santander does not allow to upload files with spaces in url
   * @param uploadDto dto to validate
   */
  public checkFileUploadDto(uploadDto: ActionPayloadDto): void {
    if (uploadDto && uploadDto.files && typeof uploadDto.files[Symbol.iterator] === 'function') {
      for (const file of uploadDto.files) {
        if (file.url && file.url.indexOf(' ') > -1) {
          file.url = encodeURI(file.url);
        }
      }
    }
  }
}
