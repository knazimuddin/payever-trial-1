import { IsString, IsNotEmpty } from 'class-validator';

export class BusinessReferenceDto {
  @IsString()
  @IsNotEmpty()
  public id: string;
}
