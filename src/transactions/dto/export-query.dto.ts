import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ExportFormat } from '../tools';
import { ListQueryDto } from './list-query.dto';

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
  public columns: any = { };

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
