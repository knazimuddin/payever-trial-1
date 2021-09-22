import { Controller, Get, HttpCode, HttpStatus, Param, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Acl, AclActionsEnum } from '@pe/nest-kit';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import { QueryDto } from '@pe/nest-kit/modules/nest-decorator';
import { FastifyReply } from 'fastify';
import { BusinessService } from '@pe/business-kit';
import { ExportQueryDto, PagingResultDto } from '../dto';
import { BusinessModel, TransactionModel } from '../models';
import { BusinessFilter, Exporter, ExportFormat } from '../tools';
import { FoldersElasticSearchService } from '@pe/folders-plugin';

@Controller('business/:businessId')
@ApiTags('business')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class BusinessFoldersController {
  private readonly defaultCurrency: string;

  constructor(
    private readonly elasticSearchService: FoldersElasticSearchService,
    private readonly businessService: BusinessService,
    private readonly configService: ConfigService,
  ) {
    this.defaultCurrency = this.configService.get<string>('DEFAULT_CURRENCY');
  }

  @Get('export')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.read })
  public async export(
    @Param('businessId') businessId: string,
    @QueryDto() exportDto: ExportQueryDto,
    @Res() res: FastifyReply<any>,
  ): Promise<void> {
    // override the page and limit (max: 10000)
    exportDto.limit = 10000;
    exportDto.page = 1;
    exportDto.filters = BusinessFilter.apply(businessId, exportDto.filters);
    const business: BusinessModel = await this.businessService
    .findOneById(businessId) as unknown as BusinessModel;
    exportDto.currency = business ? business.currency : this.defaultCurrency;
    const result: PagingResultDto =  await this.elasticSearchService.getResult(exportDto);
    const format: ExportFormat = exportDto.format;
    const fileName: string = `"${exportDto.businessName.replace(/[^\x00-\x7F]/g, '')}"`;
    const columns: Array<{ title: string, name: string }> = JSON.parse(exportDto.columns);
    Exporter.export(result.collection as TransactionModel[] , res, fileName, columns, format);
  }

}
