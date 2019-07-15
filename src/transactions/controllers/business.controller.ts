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
import { TransactionPaymentDetailsConverter } from '../converter';
import { ListQueryDto, PagingResultDto } from '../dto';
import { ActionPayloadDto } from '../dto/action-payload';
import { ActionItemInterface } from '../interfaces';
import {
  TransactionUnpackedDetailsInterface,
  TransactionWithAvailableActionsInterface,
} from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { TransactionSchemaName } from '../schemas';
import { DtoValidationService, ElasticSearchService, MessagingService, TransactionsService } from '../services';
import { BusinessFilter } from '../tools';

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
    private readonly logger: Logger,
  ) {}

  @Get('detail/reference/:reference')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  public async getDetailByReference(
    @ParamModel(
      {
        business_uuid: ':businessId',
        reference: ':reference',
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
  ): Promise<TransactionWithAvailableActionsInterface>  {
    return this.getDetails(transaction);
  }

  @Get('detail/:uuid')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  public async getDetail(
    @ParamModel(
      {
        business_uuid: ':businessId',
        uuid: ':uuid',
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
  ): Promise<TransactionWithAvailableActionsInterface> {
    return this.getDetails(transaction);
  }

  @Post(':uuid/action/:action')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  public async runAction(
    @Param('action') action: string,
    @ParamModel(
      {
        business_uuid: ':businessId',
        uuid: ':uuid',
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
    @Body() actionPayload: ActionPayloadDto,
  ): Promise<TransactionWithAvailableActionsInterface> {
    let actions: ActionItemInterface[];
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
          message: `Error occured during running action`,
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
      throw new BadRequestException(`Error occured while sending transaction update: ${e.message}`);
    }

    try {
      actions = await this.messagingService.getActionsList(unpackedTransaction);
    } catch (e) {
      this.logger.error(
        {
          context: 'BusinessController',
          error: e.message,
          message: `Error occurred while getting transaction actions`,
        },
      );
      actions = [];
    }

    return { ...updatedTransaction, actions };
  }

  @Get(':uuid/update-status')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  public async updateStatus(
    @ParamModel(
      {
        business_uuid: ':businessId',
        uuid: ':uuid',
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
  ): Promise<TransactionWithAvailableActionsInterface> {
    let actions: ActionItemInterface[];
    const outputTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    try {
      await this.messagingService.updateStatus(outputTransaction);
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

    const updated: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByUuid(transaction.uuid);
    /** Send update to checkout-php */
    try {
      await this.messagingService.sendTransactionUpdate(updated);
    } catch (e) {
      throw new BadRequestException(`Error occured while sending transaction update: ${e.message}`);
    }

    try {
      actions = await this.messagingService.getActionsList(outputTransaction);
    } catch (e) {
      this.logger.error(
        {
          context: 'BusinessController',
          error: e.message,
          message: `Error occurred while getting transaction actions`,
        },
      );
      actions = [];
    }

    return { ...updated, actions };
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
    res.set('Content-disposition', `attachment;filename=${query.businessName}-${moment().format('DD-MM-YYYY')}.csv`);
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

  private async getDetails(transaction: TransactionModel): Promise<TransactionWithAvailableActionsInterface>  {
    let actions: ActionItemInterface[];
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    try {
      actions = await this.messagingService.getActionsList(unpackedTransaction);
    } catch (e) {
      this.logger.error(
        {
          context: 'BusinessController',
          error: e.message,
          message: `Error occured while getting transaction actions`,
        },
      );
      actions = [];
    }

    return { ...unpackedTransaction, actions };
  }
}
