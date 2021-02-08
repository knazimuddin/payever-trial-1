import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CodeUpdatedDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public payment_id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  public invoice_id: string;
}
