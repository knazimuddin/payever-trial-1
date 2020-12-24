import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateIntegrationDto {
  @ApiProperty()
  @IsNotEmpty()
  public name: string;

  @ApiProperty()
  @IsNotEmpty()
  public category: string;
}
