import { IsString, IsNotEmpty } from 'class-validator';

export class HistoryEventUploadItemDto {
  @IsString()
  @IsNotEmpty()
  public type: string;

  @IsString()
  @IsNotEmpty()
  public name: string;
}
