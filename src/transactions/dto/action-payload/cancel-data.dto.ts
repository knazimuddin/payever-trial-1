import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CancelDataDto {
  @IsOptional()
  // @IsString()
  @IsNumber()
  public reason: string;

  @IsString()
  public reason2: string;
}
