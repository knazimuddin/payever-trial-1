import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { UpdateDataInfoDto } from './update-data-info.dto';

export class UpdateDataDto {

  @IsOptional()
  @IsString()
  public reason: string;

  @ValidateNested()
  public updateData: UpdateDataInfoDto;
}
