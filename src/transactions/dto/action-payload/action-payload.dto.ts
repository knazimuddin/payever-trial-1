import { ApiModelProperty } from '@nestjs/swagger';

import { ValidateNested } from 'class-validator';
import { ActionPayloadInterface } from 'src/transactions/interfaces/action-payload';
import { FieldsDto } from './fields.dto';
import { FileDataDto } from './file-data.dto';
import { GenericDto } from '../generic.dto';

export class ActionPayloadDto extends GenericDto implements ActionPayloadInterface {

  @ApiModelProperty()
  @ValidateNested()
  public fields: FieldsDto;

  @ApiModelProperty()
  @ValidateNested()
  public files: FileDataDto[];
}
