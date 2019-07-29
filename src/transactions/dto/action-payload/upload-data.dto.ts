import { ValidateNested } from 'class-validator';
import { FileModelDataDto } from './file-model-data.dto';

export class UploadDataDto {
  @ValidateNested()
  public models: [FileModelDataDto];
}
