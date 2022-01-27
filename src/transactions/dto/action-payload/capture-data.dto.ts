import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class CaptureDataDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  public amount: number;
}
