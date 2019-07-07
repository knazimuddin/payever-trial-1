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
import * as moment from 'moment';
import { TransactionPaymentDetailsConverter } from '../converter';
import { PagingResultDto, SortDto } from '../dto';
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

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  public async getList(
    @Param('businessId') businessId: string,
    @Query('orderBy') orderBy: string = 'created_at',
    @Query('direction') direction: string = 'asc',
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
    @Query('query') search: string,
    @Query('filters') filters: any = {},
  ): Promise<PagingResultDto> {
    const sort: SortDto = new SortDto(orderBy, direction);
    filters = BusinessFilter.apply(businessId, filters);

    return this.searchService.getResult(filters, sort, search, +page, +limit);
  }

  @Get('csv')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  public async getCsv(
    @Param('businessId') businessId: string,
    @Query() query,
    @Res() res: any,
  ): Promise<any> {
    const separator = ',';
    const transactions = await this.transactionsService.findAll(businessId);
    const columns = JSON.parse(query.columns);
    let header = 'CHANNEL,ID,TOTAL';
    columns.forEach(elem => {
      header = `${header}${separator}${elem.title}`;
    });
    let csv =  `${header}`;
    transactions.forEach(transaction => {
      csv = `${csv}\n`;
      csv = `${csv}${transaction.channel}`;
      csv = `${csv}${separator}${transaction.original_id}`;
      csv = `${csv}${separator}${transaction.total}`;
      columns.forEach(column => {
        csv = `${csv}${separator}${transaction[column.name] || ''}`;
      });
    });
    res.set('Content-Transfer-Encoding', `binary`);
    res.set('Access-Control-Expose-Headers', `Content-Disposition,X-Suggested-Filename`);
    res.set('Content-disposition', `attachment;filename=${query.businessName}-${moment().format('DD-MM-YYYY')}.csv`);
    res.send(csv);
  }

  @Get('detail/reference/:reference')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  public async getDetailByReference(
    @ParamModel(
      {
        reference: ':reference',
        business_uuid: ':businessId',
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
  ): Promise<TransactionWithAvailableActionsInterface>  {
    let actions: ActionItemInterface[];
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    try {
      actions = await this.messagingService.getActionsList(unpackedTransaction);
    } catch (e) {
      this.logger.error(
        {
          message: `Error occured while getting transaction actions`,
          error: e.message,
          context: 'BusinessController',
        },
      );
      actions = [];
    }

    return { ...unpackedTransaction, actions };
  }

  @Get('detail/:uuid')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  public async getDetail(
    @ParamModel(
      {
        uuid: ':uuid',
        business_uuid: ':businessId',
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
  ): Promise<TransactionWithAvailableActionsInterface> {
    let actions: ActionItemInterface[];
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    try {
      actions = await this.messagingService.getActionsList(unpackedTransaction);
    } catch (e) {
      this.logger.error(
        {
          message: `Error occured while getting transaction actions`,
          error: e.message,
          context: 'BusinessController',
        },
      );
      actions = [];
    }

    return { ...unpackedTransaction, actions };
  }

  @Post(':uuid/action/:action')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  public async runAction(
    @Param('action') action: string,
    @ParamModel(
      {
        uuid: ':uuid',
        business_uuid: ':businessId',
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
          message: `Error occured during running action`,
          error: e.message,
          context: 'BusinessController',
        },
      );

      throw new BadRequestException(e.message);
    }

    const updatedTransaction: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByUuid(unpackedTransaction.uuid);
    // Send update to checkout-php
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
          message: `Error occurred while getting transaction actions`,
          error: e.message,
          context: 'BusinessController',
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
        uuid: ':uuid',
        business_uuid: ':businessId',
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
          message: `Error occurred during status update`,
          error: e.message,
          context: 'BusinessController',
        },
      );
      throw new BadRequestException(`Error occured during status update. Please try again later. ${e.message}`);
    }

    const updated: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByUuid(transaction.uuid);
    // Send update to checkout-php
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
          message: `Error occurred while getting transaction actions`,
          error: e.message,
          context: 'BusinessController',
        },
      );
      actions = [];
    }

    return { ...updated, actions };
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
      id: null, // 9???
      limit: '',
      order_by: '',
    };
  }
}
