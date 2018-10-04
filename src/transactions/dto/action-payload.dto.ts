import { Type } from 'class-transformer';
import { ApiModelProperty } from '@nestjs/swagger';

export class ActionPayloadDto {

  @ApiModelProperty()
  fields: any;

  @ApiModelProperty()
  files: {
    url: string;
  };

}
