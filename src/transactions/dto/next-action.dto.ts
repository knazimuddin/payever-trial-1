import { ApiProperty } from '@nestjs/swagger';

export class NextActionDto {
  @ApiProperty()
  public type: string;

  @ApiProperty()
  public payment_method: string;

  @ApiProperty()
  public payload: any;
}
