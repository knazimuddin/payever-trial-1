import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { PagingDto } from './paging.dto';
import { SortingDto } from './sorting.dto';

export class ListQueryDto {
  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  public orderBy: string = 'created_at';

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  public direction: string = 'asc';

  @ApiProperty()
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  public page: number = 1;

  @ApiProperty()
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(100)
  public limit: number = 10;

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  public query?: string;

  @ApiProperty()
  @Expose()
  public filters?: any = { };

  @ApiProperty()
  @Expose()
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
