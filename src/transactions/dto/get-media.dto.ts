import { ApiModelProperty } from '@nestjs/swagger';
import { TodoItem } from '../interfaces';

export class GetTodoDto implements TodoItem {

  @ApiModelProperty()
  uuid: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty()
  dueDate: string;

}
