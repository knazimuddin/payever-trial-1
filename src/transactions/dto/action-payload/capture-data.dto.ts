import { IsString } from 'class-validator';

export class CaptureDataDto {
  @IsString()
  public amount: string;
}
