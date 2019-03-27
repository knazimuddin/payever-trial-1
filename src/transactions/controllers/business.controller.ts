import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import * as moment from 'moment';

import { ActionPayloadDto } from '../dto';
import { TransactionActionsAwareInterface } from '../interfaces';
import { TransactionModel } from '../models';

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
      csv = `${csv}${separator}${transaction.uuid}`;
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
    @Param('reference') reference: string,
    @Param('businessId') businessId: string,
  ) {
    const transaction = await this.transactionsService.findOneByParams({ reference });

    if (!transaction || transaction.business_uuid !== businessId) {
      throw new NotFoundException(`Transaction not found.`);
    }

    return { ...transaction };
  }

  @Get('detail/:uuid')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  public async getDetail(
    @Param('uuid') uuid: string,
    @Param('businessId') businessId: string,
  ): Promise<any> {
    let actions: any[];

    const transaction = await this.transactionsService.findOneByUuid(uuid);
    if (!transaction || transaction.business_uuid !== businessId) {
      throw new NotFoundException(`Transaction not found.`);
    }

    try {
      actions = await this.messagingService.getActionsList(transaction);
    } catch (e) {
      this.logger.error(`Error occured while getting transaction actions: ${e.message}`);
      actions = [];
    }

    return { ...transaction, actions };
  }

  @Post(':uuid/action/:action')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  public async runAction(
    @Param('uuid') uuid: string,
    @Param('action') action: string,
    @Param('businessId') businessId: string,
    @Body() actionPayload: ActionPayloadDto,
  ): Promise<TransactionActionsAwareInterface> {
    let actions: string[];

    this.dtoValidation.checkFileUploadDto(actionPayload);
    const transaction = await this.transactionsService.findOneByUuid(uuid);

    if (transaction.business_uuid !== businessId) {
      throw new ForbiddenException(`Company ${businessId} doesn't have rights on this transaction`);
    }
    try {
      await this.messagingService.runAction(transaction, action, actionPayload);
    } catch (e) {
      this.logger.log('Error occured during running action:\n', e);
      throw new BadRequestException(e.message);
    }

    const updatedTransaction: TransactionModel = await this.transactionsService.findOneByUuid(uuid);
    // Send update to checkout-php
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occured while sending transaction update: ${e.message}`);
    }

    try {
      actions = await this.messagingService.getActionsList(transaction);
    } catch (e) {
      this.logger.error(`Error occured while getting transaction actions: ${e.message}`);
      actions = [];
    }

    return { ...updatedTransaction, actions };
  }

  @Get(':uuid/update-status')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  public async updateStatus(
    @Param('uuid') uuid: string,
    @Param('businessId') businessId: string,
  ): Promise<TransactionActionsAwareInterface> {
    let actions: string[];

    const transaction: TransactionModel = await this.transactionsService.findOneByUuid(uuid);
    if (transaction.business_uuid !== businessId) {
      throw new ForbiddenException(`Company ${businessId} doesn't have rights on this transaction`);
    }

    try {
      await this.messagingService.updateStatus(transaction);
    } catch (e) {
      this.logger.error(`Error occured during status update: ${e}`);
      throw new BadRequestException(`Error occured during status update. Please try again later. ${e.message}`);
    }

    const updatedTransaction: TransactionModel = await this.transactionsService.findOneByUuid(uuid);
    // Send update to checkout-php
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occured while sending transaction update: ${e.message}`);
    }

    try {
      actions = await this.messagingService.getActionsList(transaction);
    } catch (e) {
      this.logger.error(`Error occured while getting transaction actions: ${e.message}`);
      actions = [];
    }

    return { ...updatedTransaction, actions };
  }

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  public async getSettings(
    @Param('businessId') businessId: string,
  ): Promise<any> {
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
