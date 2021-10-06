import { Controller, Get, HttpCode, HttpStatus, Param, Res, UseGuards } from '@nestjs/common';
import { RabbitExchangesEnum, RabbitRoutingKeys } from '../../enums';
import { ExportedFileResultDto, ExportQueryDto, ExportTransactionsSettingsDto } from '../dto';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import { Acl, AclActionsEnum, RabbitMqClient } from '@pe/nest-kit';
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
    private readonly rabbitClient: RabbitMqClient,
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
    exportDto.limit = await this.exporterService.getTransactionsCount(exportDto, businessId);

    if (exportDto.limit > 1000) {
      await this.sendRabbitEvent(exportDto, businessId);
    } else {
      const document: ExportedFileResultDto =
        await this.exporterService.exportBusinessTransactions(exportDto, businessId);
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
    exportDto.limit = await this.exporterService.getTransactionsCount(exportDto);

    if (exportDto.limit > 1000) {
      await this.sendRabbitEvent(exportDto);
    } else {
      const document: ExportedFileResultDto = await this.exporterService.exportAdminTransactions(exportDto);
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

  private async sendRabbitEvent(exportDto: ExportQueryDto, businessId?: string): Promise<void> {
    const exportTransactionsSettings: ExportTransactionsSettingsDto = {
      businessId,
      exportDto,
    };

    await this.rabbitClient.send(
      {
        channel: RabbitRoutingKeys.InternalTransactionExport,
        exchange: RabbitExchangesEnum.transactionsExport,
      },
      {
        name: RabbitRoutingKeys.InternalTransactionExport,
        payload: exportTransactionsSettings,
      },
    );
  }

}

