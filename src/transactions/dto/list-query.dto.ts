import { ApiModelProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PagingDto } from './paging.dto';
import { SortingDto } from './sorting.dto';

export class ListQueryDto {
  @ApiModelProperty()
  @IsOptional()
  @IsString()
  public orderBy: string = 'created_at';

  @ApiModelProperty()
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  public direction: string = 'asc';

  @ApiModelProperty()
  @IsOptional()
  @IsNumber()
  @Min(1)
  public page: number = 1;

  @ApiModelProperty()
  @IsOptional()
  @IsNumber()
  @Max(100)
  public limit: number = 10;

  @ApiModelProperty()
  @IsOptional()
  @IsString()
  public query: string;

  @ApiModelProperty()
  @IsNotEmpty()
  public filters: any = {};

  @ApiModelProperty()
  @IsOptional()
  @IsString()
  public currency: string;

  public get sorting(): { [key: string]: string } {
    const sorting: SortingDto = new SortingDto(this.orderBy, this.direction);

    return { [sorting.field]: sorting.direction } ;
  }

  public get paging(): PagingDto {
    return new PagingDto(this.page, this.limit);
  }

  public get search(): string {
    return this.query;
  }

  public set search(search: string) {
    this.query = search;
  }
}
