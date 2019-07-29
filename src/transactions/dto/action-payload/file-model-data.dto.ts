import { IsString } from 'class-validator';

export class FileModelDataDto {
  @IsString()
  public type: string;

  @IsString()
  public name: string;
}
