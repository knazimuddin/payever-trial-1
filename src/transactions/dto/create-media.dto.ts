import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

import { TodoItem } from '../interfaces';

export class CreateTodoDto implements TodoItem {

  @ApiModelProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

}
