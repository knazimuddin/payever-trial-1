import { ApiModelProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CodeUpdatedDto {
  @ApiModelProperty()
  @IsNotEmpty()
  @IsString()
  @Expose({name: 'payment_id'})
  public paymentId: string;

  @ApiModelProperty()
  @IsOptional()
  @IsString()
  @Expose({name: 'invoice_id'})
  public invoiceId: string;
}
