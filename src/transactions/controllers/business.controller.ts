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
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { ParamModel } from '@pe/nest-kit';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import { QueryDto } from '@pe/nest-kit/modules/nest-decorator';
import * as moment from 'moment';
import { TransactionOutputConverter, TransactionPaymentDetailsConverter } from '../converter';
import { ListQueryDto, PagingResultDto } from '../dto';
import { ActionPayloadDto } from '../dto/action-payload';
import { TransactionOutputInterface, TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { TransactionSchemaName } from '../schemas';
import {
  ActionsRetriever,
  DtoValidationService,
  ElasticSearchService,
  MessagingService,
  TransactionsService,
} from '../services';
import { BusinessFilter } from '../tools';

const BusinessPlaceholder: string = ':businessId';
const UuidPlaceholder: string = ':uuid';

@Controller('business/:businessId')
@ApiUseTags('business')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class BusinessController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly searchService: ElasticSearchService,
    private readonly dtoValidation: DtoValidationService,
    private readonly messagingService: MessagingService,
    private readonly actionsRetriever: ActionsRetriever,
    private readonly logger: Logger,
  ) {}

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
    const updatedTransaction: TransactionUnpackedDetailsInterface = await this.doAction(
      transaction,
      actionPayload,
      action,
    );

    return TransactionOutputConverter.convert(
      updatedTransaction,
      await this.actionsRetriever.retrieve(updatedTransaction),
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

    return this.searchService.getResult(listDto);
  }

  @Get('csv')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  public async getCsv(
    @Param('businessId') businessId: string,
    @Query() query: any,
    @Res() res: any,
  ): Promise<any> {
    const separator: string = ',';
    const transactions: TransactionModel[] = await this.transactionsService.findAll(businessId);
    // remove non-ASCII chars (0-127 range)
    const fileBusinessName: string = query.businessName.replace(/[^\x00-\x7F]/g, '');
    const columns: Array<{ title: string, name: string }> = JSON.parse(query.columns);
    let header: string = 'CHANNEL,ID,TOTAL';
    for (const column of columns) {
      header = `${header}${separator}${column.title}`;
    }
    let csv: string = `${header}`;
    for (const transaction of transactions) {
      csv = `${csv}\n`;
      csv = `${csv}${transaction.channel}`;
      csv = `${csv}${separator}${transaction.original_id}`;
      csv = `${csv}${separator}${transaction.total}`;
      for (const column of columns) {
        csv = `${csv}${separator}${transaction[column.name] || ''}`;
      }
    }
    res.set('Content-Transfer-Encoding', `binary`);
    res.set('Access-Control-Expose-Headers', `Content-Disposition,X-Suggested-Filename`);
    res.set('Content-disposition', `attachment;filename=${fileBusinessName}-${moment().format('DD-MM-YYYY')}.csv`);
    res.send(csv);
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
