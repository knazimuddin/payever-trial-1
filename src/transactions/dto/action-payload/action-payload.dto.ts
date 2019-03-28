import { ApiModelProperty } from '@nestjs/swagger';

import { ValidateNested } from 'class-validator';
import { FieldsDto } from './fields.dto';
import { FileDataDto } from './file-data.dto';

export class ActionPayloadDto {

  @ApiModelProperty()
  @ValidateNested()
  public fields: FieldsDto;

  @ApiModelProperty()
  @ValidateNested()
  public files: [FileDataDto];
}
