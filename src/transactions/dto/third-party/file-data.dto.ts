import { IsString, IsNotEmpty } from 'class-validator';
import { FileDataInterface } from '../../interfaces/action-payload';

export class FileDataDto implements FileDataInterface {
  @IsString()
  @IsNotEmpty()
  public url: string;
}
