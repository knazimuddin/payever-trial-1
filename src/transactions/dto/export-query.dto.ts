import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ExportFormat } from '../tools';
import { ListQueryDto } from './list-query.dto';

export class ExportQueryDto extends ListQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  public format: ExportFormat = 'csv';

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
  @Max(10000)
  public limit: number = 10;

}
