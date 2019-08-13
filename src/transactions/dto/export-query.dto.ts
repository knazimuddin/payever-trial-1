import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ListQueryDto } from './list-query.dto';
import { ExportFormat } from '../tools';

export class ExportQueryDto extends ListQueryDto {
  @ApiModelProperty()
  @IsOptional()
  @IsString()
  public format: ExportFormat = 'csv';

  @ApiModelProperty()
  @IsOptional()
  @IsString()
  public businessName: string = 'unnamed';

  @ApiModelProperty()
  @IsNotEmpty()
  public columns: any = {};

  @ApiModelProperty()
  @IsOptional()
  @IsNumber()
  @Min(1)
  public page: number = 1;

  @ApiModelProperty()
  @IsOptional()
  @IsNumber()
  @Max(10000)
  public limit: number = 10;

}
