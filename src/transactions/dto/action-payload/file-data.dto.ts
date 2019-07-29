import { IsString } from 'class-validator';

export class FileDataDto {
  @IsString()
  public url: string;
}
