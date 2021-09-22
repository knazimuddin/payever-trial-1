import { Controller, Get, HttpCode, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueryDto } from '@pe/nest-kit';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import { ExportQueryDto, PagingResultDto } from '../dto';
import { TransactionModel } from '../models';
import { Exporter, ExportFormat } from '../tools';
import { ConfigService } from '@nestjs/config';
import { FoldersElasticSearchService } from '@pe/folders-plugin';

@Controller('admin')
@ApiTags('admin')
@UseGuards(JwtAuthGuard)
@Roles(RolesEnum.admin)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class AdminFoldersController {
  private readonly defaultCurrency: string;

  constructor(
    private readonly elasticSearchService: FoldersElasticSearchService,
    private readonly configService: ConfigService,
  ) {
    this.defaultCurrency = this.configService.get<string>('DEFAULT_CURRENCY');
  }

  @Get('export')
  @HttpCode(HttpStatus.OK)
  public async export(
    @QueryDto() exportDto: ExportQueryDto,
    @Res() res: FastifyReply<any>,
  ): Promise<void> {
    // override the page and limit (max: 1000)
    exportDto.limit = 1000;
    exportDto.page = 1;
    exportDto.currency = this.defaultCurrency;
    const result: PagingResultDto =  await this.elasticSearchService.getResult(exportDto);
    const format: ExportFormat = exportDto.format;
    const fileName: string = 'export';
    const columns: Array<{ title: string, name: string }> = JSON.parse(exportDto.columns);
    Exporter.export(result.collection as TransactionModel[] , res, fileName, columns, format);
  }
}
