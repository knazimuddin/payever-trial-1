import { IsOptional, IsString } from 'class-validator';

export class CancelDataDto {
  @IsOptional()
  @IsString()
  public reason: string;

  @IsString()
  public reason2: string;
}
