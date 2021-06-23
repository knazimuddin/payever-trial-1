import {
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
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Acl, AclActionsEnum } from '@pe/nest-kit';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import { QueryDto } from '@pe/nest-kit/modules/nest-decorator';
import { FastifyReply } from 'fastify';
import { createReadStream, readFileSync, ReadStream, Stats, statSync } from 'fs';
import * as path from 'path';
import { TransactionOutputConverter } from '../converter';
import { BusinessDto, ExportQueryDto, ListQueryDto, PagingResultDto } from '../dto';
import { ActionPayloadDto } from '../dto/action-payload';
import { TransactionOutputInterface, TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { BusinessModel, TransactionModel } from '../models';
import {
  ActionsRetriever,
  BusinessService,
  ElasticSearchService,
  MessagingService,
  MongoSearchService,
  TransactionActionService,
  TransactionsExampleService,
  TransactionsService,
  TransactionsInfoService,
} from '../services';
import { BusinessFilter, Exporter, ExportFormat, IsNotTestModeFilter } from '../tools';
import { PaymentActionsEnum } from '../enum';
import { ActionItemInterface } from 'src/transactions/interfaces';

@Controller('business/:businessId')
@ApiTags('business')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class BusinessController {
  private readonly defaultCurrency: string;

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
    private readonly configService: ConfigService,
    private readonly transactionsInfoService: TransactionsInfoService,
  ) {
    this.defaultCurrency = this.configService.get<string>('DEFAULT_CURRENCY');
  }

  @Get('detail/reference/:reference')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.read })
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

    return this.transactionsInfoService.getFullDetails(transaction);
  }

  @Get('detail/original_id/:original_id')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.read })
  public async getByOriginalId(
    @Param('businessId') businessId: string,
    @Param('original_id') originalId: string,
  ): Promise<TransactionOutputInterface> {
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
      business_uuid: businessId,
      original_id: originalId,
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction by id ${originalId} not found`);
    }

    return this.transactionsInfoService.getFullDetails(transaction);
  }

  @Get('detail/:uuid')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.read })
  public async getDetail(
    @Param('businessId') businessId: string,
    @Param('uuid') transactionUuid: string,
  ): Promise<TransactionOutputInterface> {
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
      business_uuid: businessId,
      uuid: transactionUuid,
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction by uuid ${transactionUuid} not found`);
    }

    return this.transactionsInfoService.getFullDetails(transaction);
  }

  @Get('transaction/:uuid/details')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.read })
  public async getTransactionDetails(
    @Param('businessId') businessId: string,
    @Param('uuid') transactionUuid: string,
  ): Promise<TransactionOutputInterface> {
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
      business_uuid: businessId,
      uuid: transactionUuid,
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction by uuid ${transactionUuid} not found`);
    }

    return this.transactionsInfoService.getDetails(transaction);
  }

  @Get('transaction/:uuid/actions')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.read })
  public async getTransactionActions(
    @Param('businessId') businessId: string,
    @Param('uuid') transactionUuid: string,
  ): Promise<ActionItemInterface[]> {
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
      business_uuid: businessId,
      uuid: transactionUuid,
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction by uuid ${transactionUuid} not found`);
    }

    return this.transactionsInfoService.getActionList(transaction);
  }

  @Post(':uuid/action/:action')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.update })
  public async runAction(
    @Param('action') action: string,
    @Param('businessId') businessId: string,
    @Param('uuid') transactionUuid: string,
    @Body() actionPayload: ActionPayloadDto,
  ): Promise<TransactionOutputInterface> {
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
      business_uuid: businessId,
      uuid: transactionUuid,
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction by uuid ${transactionUuid} not found`);
    }

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
    @Param('businessId') businessId: string,
    @Param('uuid') transactionUuid: string,
    @Res() res: FastifyReply<any>,
  ): Promise<any> {
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
      business_uuid: businessId,
      uuid: transactionUuid,
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction by uuid ${transactionUuid} not found`);
    }

    const pdfPath: string = path.resolve(`./example_data/${pdf}`);
    const pdfStream: ReadStream = createReadStream(pdfPath);
    const stats: Stats = statSync(pdfPath);

    res.header('Content-Disposition', `inline; filename="${transaction.uuid}.pdf"`);
    res.header('Content-Length', stats.size);
    res.header('Content-Type', 'application/pdf');
    res.send(pdfStream);
  }

  @Get(':uuid/slip/:name')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.anonymous)
  public async slip(
    @Param('name') name: string,
  ): Promise<any> {
    const slipPath: string = path.resolve(`./example_data/${name}`);

    return JSON.parse(readFileSync(slipPath, 'utf8'));
  }

  @Post(':uuid/legacy-api-action/shipped')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.oauth)
  public async runLegacyApiShippedAction(
    @Param('businessId') businessId: string,
    @Param('uuid') transactionUuid: string,
    @Body() actionPayload: ActionPayloadDto,
  ): Promise<TransactionUnpackedDetailsInterface> {
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
      business_uuid: businessId,
      uuid: transactionUuid,
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction by uuid ${transactionUuid} not found`);
    }

    return this.transactionActionService.doAction(
      transaction,
      actionPayload,
      PaymentActionsEnum.ShippingGoods,
      true,
    );
  }

  @Post(':uuid/legacy-api-action/:action')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.oauth)
  public async runLegacyApiAction(
    @Param('action') action: string,
    @Param('businessId') businessId: string,
    @Param('uuid') transactionUuid: string,
    @Body() actionPayload: ActionPayloadDto,
  ): Promise<TransactionUnpackedDetailsInterface> {
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
      business_uuid: businessId,
      uuid: transactionUuid,
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction by uuid ${transactionUuid} not found`);
    }

    return this.transactionActionService.doAction(
      transaction,
      actionPayload,
      action,
    );
  }

  @Get(':uuid/update-status')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.read })
  public async updateStatus(
    @Param('businessId') businessId: string,
    @Param('uuid') transactionUuid: string,
  ): Promise<TransactionOutputInterface> {
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
      business_uuid: businessId,
      uuid: transactionUuid,
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction by uuid ${transactionUuid} not found`);
    }

    const updatedTransaction: TransactionUnpackedDetailsInterface =
      await this.transactionActionService.updateStatus(transaction);

    return TransactionOutputConverter.convert(
      updatedTransaction,
      await this.actionsRetriever.retrieve(updatedTransaction),
    );
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.read })
  public async getList(
    @Param('businessId') businessId: string,
    @QueryDto() listDto: ListQueryDto,
  ): Promise<PagingResultDto> {
    listDto.filters = BusinessFilter.apply(businessId, listDto.filters);
    const business: BusinessModel = await this.businessService.findBusinessById(businessId);
    listDto.currency = business ? business.currency : this.defaultCurrency;

    if (!listDto.filters.test_mode) {
      listDto.filters = IsNotTestModeFilter.apply(listDto.filters);
    }

    return this.elasticSearchService.getResult(listDto);
  }

  @Get('mongo')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.read })
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
    const business: BusinessModel = await this.businessService.findBusinessById(businessId);
    exportDto.currency = business ? business.currency : this.defaultCurrency;
    const result: PagingResultDto =  await this.elasticSearchService.getResult(exportDto);
    const format: ExportFormat = exportDto.format;
    const fileName: string = `"${exportDto.businessName.replace(/[^\x00-\x7F]/g, '')}"`;
    const columns: Array<{ title: string, name: string }> = JSON.parse(exportDto.columns);
    Exporter.export(result.collection as TransactionModel[] , res, fileName, columns, format);
  }

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.read })
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
    return this.exampleService.createBusinessExamples(businessDto, []);
  }
}
