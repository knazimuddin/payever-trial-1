import { ApiModelProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class TransactionUpdateDto {
  @ApiModelProperty()
  @IsOptional()
  @Expose({name: 'invoice_id'})
  public invoiceId;
}
