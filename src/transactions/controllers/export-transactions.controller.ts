import { Controller, Get, HttpCode, HttpStatus, Param, Res, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitChannels, RabbitRoutingKeys } from '../../enums';
import { ExportedFileResultDto, ExportQueryDto } from '../dto';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import { Acl, AclActionsEnum } from '@pe/nest-kit';
import { QueryDto } from '@pe/nest-kit/modules/nest-decorator';
import { FastifyReply } from 'fastify';
import * as moment from 'moment';
import { ExporterService } from '../services';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class ExportTransactionsController {
  constructor(
    private readonly configService: ConfigService,
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
    const document: ExportedFileResultDto =
      await this.exporterService.exportBusinessTransactions(exportDto, businessId);
    await this.returnDocument(document, res);
  }

  @Get('admin/export')
  @ApiTags('admin')
  @Roles(RolesEnum.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public async exportAdminTransactions(
    @QueryDto() exportDto: ExportQueryDto,
    @Res() res: FastifyReply<any>,
  ): Promise<void> {
    const document: ExportedFileResultDto = await this.exporterService.exportAdminTransactions(exportDto);
    await this.returnDocumentBuChunks(document, res);
  }

  @MessagePattern({
    channel: RabbitChannels.TransactionsExport,
    name: RabbitRoutingKeys.InternalTransactionExport,
  })
  public async onExportTransactionEvent (
    exportDto: ExportQueryDto,
    businessId?: string,
  ): Promise<void> {
    const document: ExportedFileResultDto =
      await this.exporterService.exportBusinessTransactions(exportDto, businessId);
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

  private async returnDocument(document: ExportedFileResultDto, res: FastifyReply<any>): Promise<void> {
    res.header('Content-Transfer-Encoding', `binary`);
    res.header('Access-Control-Expose-Headers', `Content-Disposition,X-Suggested-Filename`);
    res.header(
      'Content-disposition',
      `attachment;filename=${document.fileName}-${moment().format('DD-MM-YYYY')}.pdf`,
    );
    res.send(document.data);
  }

}

