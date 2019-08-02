import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveBusinessDto {
  @IsString()
  @IsNotEmpty()
  public _id;
}
