import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { Acl, AclActionsEnum, ParamModel } from '@pe/nest-kit';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import { QueryDto } from '@pe/nest-kit/modules/nest-decorator';
import { FastifyReply } from 'fastify';
import { createReadStream, readFileSync, ReadStream, Stats, statSync } from 'fs';
import * as path from 'path';
import { environment } from '../../environments';
import { TransactionOutputConverter, TransactionPaymentDetailsConverter } from '../converter';
import { BusinessDto, ExportQueryDto, ListQueryDto, PagingResultDto } from '../dto';
import { ActionPayloadDto } from '../dto/action-payload';
import { TransactionOutputInterface, TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { BusinessModel, TransactionModel } from '../models';
import { TransactionsNotifier } from '../notifiers';
import { TransactionSchemaName } from '../schemas';
import {
  ActionsRetriever,
  BusinessService,
  ElasticSearchService,
  MessagingService,
  MongoSearchService,
  TransactionActionService,
  TransactionsExampleService,
  TransactionsService,
} from '../services';
import { BusinessFilter, Exporter, ExportFormat } from '../tools';

const BusinessPlaceholder: string = ':businessId';
const UuidPlaceholder: string = ':uuid';

@Controller('business/:businessId')
@ApiUseTags('business')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class BusinessController {
  private defaultCurrency: string;

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly mongoSearchService: MongoSearchService,
    private readonly elasticSearchService: ElasticSearchService,
    private readonly messagingService: MessagingService,
    private readonly actionsRetriever: ActionsRetriever,
    private readonly transactionActionService: TransactionActionService,
    private readonly logger: Logger,
    private readonly businessService: BusinessService,
    private readonly exampleService: TransactionsExampleService,
    private readonly transactionsNotifier: TransactionsNotifier,
  ) {
    this.defaultCurrency = environment.defaultCurrency;
  }

  @Get('detail/reference/:reference')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  @Acl({microservice: 'transactions', action: AclActionsEnum.read})
  public async getDetailByReference(
    @Param('businessId') businessId: string,
    @Param('reference') reference: string,
  ): Promise<TransactionOutputInterface>  {
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
      business_uuid: businessId,
      reference: reference,
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction by reference ${reference} not found`);
    }

    return this.getDetails(transaction);
  }

  @Get('detail/original_id/:original_id')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  @Acl({microservice: 'transactions', action: AclActionsEnum.read})
  public async getByOriginalId(
    @ParamModel(
      {
        business_uuid: BusinessPlaceholder,
        original_id: ':original_id',
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
  ): Promise<TransactionOutputInterface> {
    return this.getDetails(transaction);
  }

  @Get('detail/:uuid')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  @Acl({microservice: 'transactions', action: AclActionsEnum.read})
  public async getDetail(
    @ParamModel(
      {
        business_uuid: BusinessPlaceholder,
        uuid: UuidPlaceholder,
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
  ): Promise<TransactionOutputInterface> {
    return this.getDetails(transaction);
  }

  @Post(':uuid/action/:action')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  @Acl({microservice: 'transactions', action: AclActionsEnum.update})
  public async runAction(
    @Param('action') action: string,
    @ParamModel(
      {
        business_uuid: BusinessPlaceholder,
        uuid: UuidPlaceholder,
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
    @Body() actionPayload: ActionPayloadDto,
  ): Promise<TransactionOutputInterface> {
    const updatedTransaction: TransactionUnpackedDetailsInterface = !transaction.example
      ? await this.transactionActionService.doAction(
        transaction,
        actionPayload,
        action,
      )
      : await this.transactionActionService.doFakeAction(
        transaction,
        actionPayload,
        action,
      )
    ;

    return TransactionOutputConverter.convert(
      updatedTransaction,
      !transaction.example
        ? await this.actionsRetriever.retrieve(updatedTransaction)
        : this.actionsRetriever.retrieveFakeActions(updatedTransaction)
      ,
    );
  }

  @Get(':uuid/label/:pdf')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.anonymous)
  public async label(
    @Param('pdf') pdf: string,
    @ParamModel(
      {
        business_uuid: BusinessPlaceholder,
        uuid: UuidPlaceholder,
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
    @Res() res: FastifyReply<any>,
  ): Promise<any> {
    const pdfPath: string = path.resolve(`./example_data/${pdf}`);
    const pdfStream: ReadStream = createReadStream(pdfPath);
    const stats: Stats = statSync(pdfPath);

    res.header('Content-Disposition', `inline; filename="${transaction.uuid}.pdf"`);
    res.header('Content-Length', stats.size);
    res.header('Content-Type', 'application/pdf');
    res.send(pdfStream)
  }

  @Get(':uuid/slip/:name')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.anonymous)
  public async slip(
    @Param('name') name: string,
    @ParamModel({ business_uuid: BusinessPlaceholder }, TransactionSchemaName) business: BusinessModel,
    @ParamModel(
      {
        business_uuid: BusinessPlaceholder,
        uuid: UuidPlaceholder,
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
  ): Promise<any> {
    const slipPath: string = path.resolve(`./example_data/${name}`);

    return JSON.parse(readFileSync(slipPath, 'utf8'));
  }

  @Post(':uuid/legacy-api-action/:action')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.oauth)
  public async runLegacyApiAction(
    @Param('action') action: string,
    @ParamModel(
      {
        business_uuid: BusinessPlaceholder,
        uuid: UuidPlaceholder,
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
    @Body() actionPayload: ActionPayloadDto,
  ): Promise<TransactionUnpackedDetailsInterface> {
    return this.transactionActionService.doAction(
      transaction,
      actionPayload,
      action,
    );
  }

  @Get(':uuid/update-status')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  @Acl({microservice: 'transactions', action: AclActionsEnum.read})
  public async updateStatus(
    @ParamModel(
      {
        business_uuid: BusinessPlaceholder,
        uuid: UuidPlaceholder,
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
  ): Promise<TransactionOutputInterface> {
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    try {
      await this.messagingService.updateStatus(unpackedTransaction);
    } catch (e) {
      this.logger.error(
        {
          context: 'BusinessController',
          error: e.message,
          message: `Error occurred during status update`,
        },
      );
      throw new BadRequestException(`Error occurred during status update. Please try again later. ${e.message}`);
    }

    const updatedTransaction: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByUuid(transaction.uuid);
    /** Send update to checkout-php */
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occurred while sending transaction update: ${e.message}`);
    }

    return TransactionOutputConverter.convert(
      updatedTransaction,
      await this.actionsRetriever.retrieve(updatedTransaction),
    );
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  @Acl({microservice: 'transactions', action: AclActionsEnum.read})
  public async getList(
    @Param('businessId') businessId: string,
    @QueryDto() listDto: ListQueryDto,
  ): Promise<PagingResultDto> {
    listDto.filters = BusinessFilter.apply(businessId, listDto.filters);
    const business: BusinessModel = await this.businessService.findBusinessById(businessId);
    listDto.currency = business ? business.currency : this.defaultCurrency;

    return this.elasticSearchService.getResult(listDto);
  }

  @Get('mongo')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  @Acl({microservice: 'transactions', action: AclActionsEnum.read})
  public async getMongo(
    @Param('businessId') businessId: string,
    @QueryDto() listDto: ListQueryDto,
  ): Promise<PagingResultDto> {
    listDto.filters = BusinessFilter.apply(businessId, listDto.filters);
    const business: BusinessModel = await this.businessService.findBusinessById(businessId);
    listDto.currency = business ? business.currency : this.defaultCurrency;

    return this.mongoSearchService.getResult(listDto);
  }

  @Get('export')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  @Acl({microservice: 'transactions', action: AclActionsEnum.read})
  public async export(
    @Param('businessId') businessId: string,
    @QueryDto() exportDto: ExportQueryDto,
    @Res() res: FastifyReply<any>,
  ): Promise<void> {
    // override the page and limit (max: 10000)
    exportDto.limit = 10000;
    exportDto.page = 1;
    exportDto.filters = BusinessFilter.apply(businessId, exportDto.filters);
    const business: BusinessModel = await this.businessService.findBusinessById(businessId);
    exportDto.currency = business ? business.currency : this.defaultCurrency;
    const result: PagingResultDto =  await this.elasticSearchService.getResult(exportDto);
    const format: ExportFormat = exportDto.format;
    const fileName: string = exportDto.businessName.replace(/[^\x00-\x7F]/g, '');
    const columns: Array<{ title: string, name: string }> = JSON.parse(exportDto.columns);
    Exporter.export(result.collection as TransactionModel[] , res, fileName, columns, format);
  }

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  @Acl({microservice: 'transactions', action: AclActionsEnum.read})
  public async getSettings(): Promise<any> {
    return {
      columns_to_show: [
        'created_at',
        'customer_email',
        'customer_name',
        'merchant_email',
        'merchant_name',
        'specific_status',
        'status',
        'type',
      ],
      direction: '',
      filters: null,
      id: null,
      limit: '',
      order_by: '',
    };
  }

  @Post('trigger-example')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.anonymous)
  public async triggerExample(
    @Body() businessDto: BusinessDto,
  ): Promise<any> {
    return this.exampleService.createBusinessExamples(businessDto);
  }

  private async getDetails(transaction: TransactionModel): Promise<TransactionOutputInterface>  {
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    await this.transactionsNotifier.cancelNewTransactionNotification(transaction);

    return TransactionOutputConverter.convert(
      unpackedTransaction,
      !transaction.example
        ? await this.actionsRetriever.retrieve(unpackedTransaction)
        : this.actionsRetriever.retrieveFakeActions(unpackedTransaction)
      ,
    );
  }
}
