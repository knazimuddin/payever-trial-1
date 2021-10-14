import { Controller, Get, HttpCode, HttpStatus, Param, Res, UseGuards, BadRequestException } from '@nestjs/common';
import { ExportedFileResultDto, ExportQueryDto } from '../dto';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import { Acl, AclActionsEnum } from '@pe/nest-kit';
import { QueryDto } from '@pe/nest-kit/modules/nest-decorator';
import { FastifyReply } from 'fastify';
import * as moment from 'moment';
import { ExporterService } from '../services';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExportFormatEnum } from '../enum';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class ExportTransactionsController {
  constructor(
    private readonly exporterService: ExporterService,
  ) { }

  @Get('business/:businessId/export')
  @ApiTags('business')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.read })
  public async exportBusinessTransactions(
    @Param('businessId') businessId: string,
    @QueryDto() exportDto: ExportQueryDto,
    @Res() res: FastifyReply<any>,
  ): Promise<void> {
    exportDto.page = 1;
    const transactionsCount: number = await this.exporterService.getTransactionsCount(exportDto, businessId);

    if (transactionsCount > 10000) {
      if (exportDto.format === ExportFormatEnum.pdf) {
        throw new BadRequestException(`transactions.export.error.limit_more_than_10000_not_allowed_for_pdf`);
      }
      exportDto.limit = 1000;
      this.exporterService.sendRabbitEvent(exportDto, transactionsCount, '', businessId);
      this.returnExportingStarted(res);
    } else {
      exportDto.limit = transactionsCount;
      const document: ExportedFileResultDto =
        await this.exporterService.exportBusinessTransactions(exportDto, businessId, transactionsCount);
      await this.returnDocument(exportDto.format, document, res);
    }
  }

  @Get('admin/export')
  @ApiTags('admin')
  @UseGuards(JwtAuthGuard)
  @Roles(RolesEnum.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public async exportAdminTransactions(
    @QueryDto() exportDto: ExportQueryDto,
    @Res() res: FastifyReply<any>,
  ): Promise<void> {
    exportDto.page = 1;
    const transactionsCount: number = await this.exporterService.getTransactionsCount(exportDto);

    if (transactionsCount > 10000) {
      if (exportDto.format === ExportFormatEnum.pdf) {
        throw new BadRequestException(`transactions.export.error.limit_more_than_10000_not_allowed_for_pdf`);
      }
      exportDto.limit = 10000;
      this.exporterService.sendRabbitEvent(exportDto, transactionsCount);
      this.returnExportingStarted(res);
    } else {
      exportDto.limit = transactionsCount;
      const document: ExportedFileResultDto =
        await this.exporterService.exportAdminTransactions(exportDto, transactionsCount);
      await this.returnDocument(exportDto.format, document, res);
    }
  }

  private async returnDocument(
    exportFormat: ExportFormatEnum,
    document: ExportedFileResultDto,
    res: FastifyReply<any>,
  ): Promise<void> {
    if (exportFormat === ExportFormatEnum.pdf) {
      await this.returnDocumentBuChunks(document, res);
    } else {
      await this.returnDocumentInOnePart(document, res);
    }
  }

  private returnExportingStarted(
    res: FastifyReply<any>,
  ): void {
    res.code(HttpStatus.ACCEPTED);
    res.send();
  }

  private async returnDocumentInOnePart(
    document: ExportedFileResultDto,
    res: FastifyReply<any>,
  ): Promise<void> {
    res.header('Content-Transfer-Encoding', `binary`);
    res.header('Access-Control-Expose-Headers', `Content-Disposition,X-Suggested-Filename`);
    res.header(
      'Content-disposition',
      `attachment;filename=${document.fileName}`,
    );
    res.send(document.data);
  }

  private async returnDocumentBuChunks(document: ExportedFileResultDto, res: FastifyReply<any>): Promise<void> {
    const chunks: any[] = [];
    document.data.on('data', (chunk: any) => {
      chunks.push(chunk);
    });

    document.data.on('end', () => {
      res.header('Content-Transfer-Encoding', `binary`);
      res.header('Access-Control-Expose-Headers', `Content-Disposition,X-Suggested-Filename`);
      res.header(
        'Content-disposition',
        `attachment;filename=${document.fileName}-${moment().format('DD-MM-YYYY')}.pdf`,
      );
      res.send(Buffer.concat(chunks));
    });
    document.data.end();
  }

}

