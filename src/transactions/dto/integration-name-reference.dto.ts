import { IsString, IsNotEmpty } from 'class-validator';

export class IntegrationNameReferenceDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
}
