import { IsNotEmpty, IsString} from 'class-validator';

export class BusinessDto {
  @IsNotEmpty()
  @IsString()
  public uuid: string;
}
