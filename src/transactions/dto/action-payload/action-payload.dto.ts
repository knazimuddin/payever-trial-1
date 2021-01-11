import { ApiProperty } from '@nestjs/swagger';

import { ValidateNested } from 'class-validator';
import { ActionPayloadInterface } from 'src/transactions/interfaces/action-payload';
import { FieldsDto } from './fields.dto';
import { FileDataDto } from './file-data.dto';

export class ActionPayloadDto implements ActionPayloadInterface {

  @ApiProperty()
  @ValidateNested()
  public fields: FieldsDto;

  @ApiProperty()
  @ValidateNested()
  public files: FileDataDto[];
}
