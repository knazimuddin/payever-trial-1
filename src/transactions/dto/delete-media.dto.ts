import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

import { TodoItem } from '../interfaces';

export class UpdateTodoDto implements TodoItem {

  @ApiModelProperty()
  @IsNotEmpty()
  @IsString()
  uuid: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

}
