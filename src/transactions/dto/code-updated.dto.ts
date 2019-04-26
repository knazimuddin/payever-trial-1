import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CodeUpdatedDto {
  @ApiModelProperty()
  @IsNotEmpty()
  @IsString()
  public payment_id: string;

  @ApiModelProperty()
  @IsOptional()
  @IsString()
  public invoice_id: string;
}
