import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ExportFormatEnum } from '../../enum';
import { ListQueryDto } from '@pe/folders-plugin';

export class ExportQueryDto extends ListQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  public format: ExportFormatEnum = ExportFormatEnum.csv;

  @ApiProperty()
  @IsOptional()
  @IsString()
  public businessName: string = 'unnamed';

  @ApiProperty()
  @IsNotEmpty()
  public columns: any = { };

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(1)
  public page: number = 1;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Max(20000)
  public limit: number = 10;

  @ApiProperty()
  @IsOptional()
  @IsString()
  public language: string = 'en';

}
