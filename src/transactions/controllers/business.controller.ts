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
import { ActionPayloadDto } from '../dto/action-payload';
import { TransactionActionsAwareInterface } from '../interfaces';
import { TransactionModel } from '../models';
import { TransactionSchemaName } from '../schemas';

import { DtoValidationService, MessagingService, TransactionsGridService, TransactionsService } from '../services';

@Controller('business/:businessId')
@ApiUseTags('business')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class BusinessController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly transactionsGridService: TransactionsGridService,
    private readonly dtoValidation: DtoValidationService,
    private readonly messagingService: MessagingService,
    private readonly logger: Logger,
  ) {
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  public async getList(
    @Param('businessId') businessId: string,
    @Query('orderBy') orderBy: string = 'created_at',
    @Query('direction') direction: string = 'asc',
    @Query('limit') limit: number = 3,
    @Query('page') page: number = 1,
    @Query('query') search: string,
    @Query('filters') filters: any = {},
  ): Promise<any> {
    filters.business_uuid = {
      condition: 'is',
      value: businessId,
    };

    return this.transactionsGridService.getList(filters, orderBy, direction, search, +page, +limit);
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
      { reference: ':reference', business_uuid: ':businessId'},
      TransactionSchemaName,
    ) transaction: TransactionModel,
  ) {
    const outputTransaction = this.transactionsService.prepareTransactionForOutput(
      transaction.toObject({ virtuals: true }),
    );

    return { ...outputTransaction };
  }

  @Get('detail/:uuid')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.anonymous)
  public async getDetail(
    @ParamModel({ uuid: ':uuid', business_uuid: ':businessId'}, TransactionSchemaName) transaction: TransactionModel,
  ): Promise<any> {
    let actions: any[];

    const outputTransaction = this.transactionsService.prepareTransactionForOutput(
      transaction.toObject({ virtuals: true }),
    );

    try {
      actions = await this.messagingService.getActionsList(outputTransaction);
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

    return { ...outputTransaction, actions };
  }

  @Post(':uuid/action/:action')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  public async runAction(
    @Param('action') action: string,
    @ParamModel({ uuid: ':uuid', business_uuid: ':businessId'}, TransactionSchemaName) transaction: TransactionModel,
    @Body() actionPayload: ActionPayloadDto,
  ): Promise<TransactionActionsAwareInterface> {
    let actions: string[];

    this.dtoValidation.checkFileUploadDto(actionPayload);

    const outputTransaction = this.transactionsService.prepareTransactionForOutput(
      transaction.toObject({ virtuals: true }),
    );

    try {
      await this.messagingService.runAction(outputTransaction, action, actionPayload);
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

    const updatedTransaction: TransactionModel = await this.transactionsService.findOneByUuid(transaction.uuid);
    // Send update to checkout-php
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
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

    return { ...updatedTransaction, actions };
  }

  @Get(':uuid/update-status')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  public async updateStatus(
    @ParamModel({ uuid: ':uuid', business_uuid: ':businessId'}, TransactionSchemaName) transaction: TransactionModel,
  ): Promise<TransactionActionsAwareInterface> {
    let actions: string[];

    const outputTransaction = this.transactionsService.prepareTransactionForOutput(
      transaction.toObject({ virtuals: true }),
    );

    try {
      await this.messagingService.updateStatus(transaction);
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

    const updatedTransaction: TransactionModel = await this.transactionsService.findOneByUuid(transaction.uuid);
    // Send update to checkout-php
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
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

    return { ...updatedTransaction, actions };
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
