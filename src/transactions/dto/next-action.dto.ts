import { ApiModelProperty } from '@nestjs/swagger';

export class NextActionDto {
  @ApiModelProperty()
  public type: string;

  @ApiModelProperty()
  public payment_method: string;

  @ApiModelProperty()
  public payload: any;
}
