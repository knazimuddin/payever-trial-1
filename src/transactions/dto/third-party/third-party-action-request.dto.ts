import { ValidateNested, IsDefined, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ThirdPartyActionRequestInterface } from '../../interfaces/third-party';
import { BusinessReferenceDto } from '../business-reference.dto';
import { FileDataDto } from './file-data.dto';
import { FieldsDto } from '../action-payload';
import { IntegrationNameReferenceDto } from '../integration-name-reference.dto';

export class ThirdPartyActionRequestDto implements ThirdPartyActionRequestInterface {
  @IsString()
  @IsNotEmpty()
  public reference: string;

  @IsString()
  @IsNotEmpty()
  public action: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => BusinessReferenceDto)
  public business: BusinessReferenceDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => IntegrationNameReferenceDto)
  public integration: IntegrationNameReferenceDto;

  @IsDefined()
  public fields: FieldsDto;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => FileDataDto)
  public files?: FileDataDto[];
}
