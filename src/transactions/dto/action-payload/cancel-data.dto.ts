import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CancelDataDto {
  @IsOptional()
  @IsNumber()
  public amount: number;

  @IsOptional()
  @IsString()
  public reason: string;

  @IsOptional()
  @IsString()
  public reason2: string;
}
