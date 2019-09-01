import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { ParamModel } from '@pe/nest-kit';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import { QueryDto } from '@pe/nest-kit/modules/nest-decorator';
import { FastifyReply } from 'fastify';
import { environment } from '../../environments';

import { TransactionOutputConverter, TransactionPaymentDetailsConverter } from '../converter';
import { ExportQueryDto, ListQueryDto, PagingResultDto } from '../dto';
import { ActionPayloadDto } from '../dto/action-payload';
import { ActionItemInterface } from '../interfaces';
import { TransactionOutputInterface, TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { BusinessModel, TransactionModel } from '../models';
import { TransactionSchemaName } from '../schemas';
import {
  ActionsRetriever,
  BusinessService,
  DtoValidationService,
  ElasticSearchService,
  MessagingService,
  MongoSearchService,
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
    private readonly searchService: MongoSearchService,
    private readonly elasticSearchService: ElasticSearchService,
    private readonly dtoValidation: DtoValidationService,
    private readonly messagingService: MessagingService,
    private readonly actionsRetriever: ActionsRetriever,
    private readonly logger: Logger,
    private readonly businessService: BusinessService,
  ) {
    this.defaultCurrency = environment.defaultCurrency;
  }

  @Get('detail/reference/:reference')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  public async getDetailByReference(
    @ParamModel(
      {
        business_uuid: BusinessPlaceholder,
        reference: ':reference',
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
  ): Promise<TransactionOutputInterface>  {
    return this.getDetails(transaction);
  }

  @Get('detail/:uuid')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
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
      ? await this.doAction(
        transaction,
        actionPayload,
        action,
      )
      : await this.doFakeAction(
        transaction,
        actionPayload,
        action,
      )
    ;

    return TransactionOutputConverter.convert(
      updatedTransaction,
      !transaction.example
        ? await this.actionsRetriever.retrieve(updatedTransaction)
        : this.retrieveFakeActions(updatedTransaction)
      ,
    );
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
    return this.doAction(
      transaction,
      actionPayload,
      action,
    );
  }

  @Get(':uuid/update-status')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
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
      throw new BadRequestException(`Error occured during status update. Please try again later. ${e.message}`);
    }

    const updatedTransaction: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByUuid(transaction.uuid);
    /** Send update to checkout-php */
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occured while sending transaction update: ${e.message}`);
    }

    return TransactionOutputConverter.convert(
      updatedTransaction,
      await this.actionsRetriever.retrieve(updatedTransaction),
    );
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  public async getList(
    @Param('businessId') businessId: string,
    @QueryDto() listDto: ListQueryDto,
  ): Promise<PagingResultDto> {
    listDto.filters = BusinessFilter.apply(businessId, listDto.filters);
    const business: BusinessModel = await this.businessService.getBusinessCurrency(businessId);
    listDto.currency = business ? business.currency : this.defaultCurrency;

    return this.searchService.getResult(listDto);
  }

  @Get('elastic')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  public async getElastic(
    @Param('businessId') businessId: string,
    @QueryDto() listDto: ListQueryDto,
  ): Promise<PagingResultDto> {
    listDto.filters = BusinessFilter.apply(businessId, listDto.filters);
    const currency: BusinessModel = await this.businessService.getBusinessCurrency(businessId);
    listDto.currency = currency ? currency.currency : this.defaultCurrency;

    return this.elasticSearchService.getResult(listDto);
  }

  @Get('export')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  public async export(
    @Param('businessId') businessId: string,
    @QueryDto() exportDto: ExportQueryDto,
    @Res() res: FastifyReply<any>,
  ): Promise<void> {
    // override the page and limit (max: 10000)
    exportDto.limit = 10000;
    exportDto.page = 1;
    exportDto.filters = BusinessFilter.apply(businessId, exportDto.filters);
    const business: BusinessModel = await this.businessService.getBusinessCurrency(businessId);
    exportDto.currency = business ? business.currency : this.defaultCurrency;
    const result: PagingResultDto =  await this.searchService.getResult(exportDto);
    const format: ExportFormat = exportDto.format;
    const fileName: string = exportDto.businessName.replace(/[^\x00-\x7F]/g, '');
    const columns: Array<{ title: string, name: string }> = JSON.parse(exportDto.columns);
    Exporter.export(result.collection as TransactionModel[] , res, fileName, columns, format);
  }

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
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

  private async doAction(
    transaction: TransactionModel,
    actionPayload: ActionPayloadDto,
    action: string,
  ): Promise<TransactionUnpackedDetailsInterface> {
    this.dtoValidation.checkFileUploadDto(actionPayload);
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    try {
      await this.messagingService.runAction(unpackedTransaction, action, actionPayload);
    } catch (e) {
      this.logger.log(
        {
          context: 'BusinessController',
          error: e.message,
          message: `Error occurred during running action`,
        },
      );

      throw new BadRequestException(e.message);
    }

    const updatedTransaction: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByUuid(unpackedTransaction.uuid);
    /** Send update to checkout-php */
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occurred while sending transaction update: ${e.message}`);
    }

    return updatedTransaction;
  }

  private async doFakeAction(
    transaction: TransactionModel,
    actionPayload: ActionPayloadDto,
    action: string,
  ): Promise<TransactionUnpackedDetailsInterface> {
    switch (action) {
      case 'shipping_goods':
        transaction.status = 'STATUS_PAID';
        transaction.place = 'paid';
        transaction.shipping_order_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
        switch (transaction.billing_address.id) {
          case 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa':
            transaction.example_shipping_label =
              `/api/business/${transaction.business_uuid}/${transaction.uuid}/`
                + `label/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.pdf`;
            break;
          case 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb':
            transaction.example_shipping_label =
              `/api/business/${transaction.business_uuid}/${transaction.uuid}/`
              + `label/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb.pdf`;

            break;
        }

        break;
      case 'refund':
        transaction.status = 'STATUS_REFUNDED';
        transaction.place = 'refunded';

        break;
      case 'cancel':
        transaction.status = 'STATUS_CANCELLED';
        transaction.place = 'cancelled';

        break;
      default:
    }

    await transaction.save();

    return this.transactionsService.findUnpackedByUuid(transaction.uuid);
  }

  private retrieveFakeActions(unpackedTransaction: TransactionUnpackedDetailsInterface): ActionItemInterface[] {
    switch (unpackedTransaction.status) {
      case 'STATUS_ACCEPTED':
        return [
          {
            action: 'refund',
            enabled: true,
          },
          {
            action: 'cancel',
            enabled: true,
          },
          {
            action: 'shipping_goods',
            enabled: true,
          },
        ];
      case 'STATUS_PAID':
      case 'STATUS_REFUNDED':
        return [
          {
            action: 'refund',
            enabled: true,
          },
        ];
      case 'STATUS_CANCELLED':
        return [];
    }
  }

  private async getDetails(transaction: TransactionModel): Promise<TransactionOutputInterface>  {
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    return TransactionOutputConverter.convert(
      unpackedTransaction,
      await this.actionsRetriever.retrieve(unpackedTransaction),
    );
  }
}
