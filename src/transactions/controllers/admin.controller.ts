import {
  Controller,
  Get, Headers,
  HttpCode,
  HttpStatus, NotFoundException,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  Body,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesEnum, User, UserTokenInterface } from '@pe/nest-kit/modules/auth';
import { snakeCase } from 'lodash';

import {
  TransactionsGridService,
  TransactionsService,
  MessagingService,
  DtoValidationService,
} from '../services';
import { ActionPayloadDto } from '../dto';

// TODO: unify with business controller
@Controller('admin')
@ApiUseTags('admin')
@UseGuards(JwtAuthGuard)
@Roles(RolesEnum.admin)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class AdminController {

  constructor(
    private readonly dtoValidation: DtoValidationService,
    private readonly transactionsService: TransactionsService,
    private readonly transactionsGridService: TransactionsGridService,
    private readonly messagingService: MessagingService,
  ) {
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  public async getList(
    @Query('orderBy') orderBy: string = 'created_at',
    @Query('direction') direction: string = 'asc',
    @Query('limit') limit: number = 3,
    @Query('page') page: number = 1,
    @Query('query') search: string,
    @Query('filters') filters: any = {},
    @Query('currency') currency: string,
  ): Promise<any> {
    return this.transactionsGridService
      .getList(filters, orderBy, direction, search, +page, +limit, currency);
  }

  @Get('detail/reference/:reference')
  @HttpCode(HttpStatus.OK)
  public async getDetailByReference(@Param('reference') reference: string) {
    const transaction = await this.transactionsService.findOneByParams({ reference });

    return { ...transaction };
  }

  @Get('detail/:uuid')
  @HttpCode(HttpStatus.OK)
  public async getDetail(
    @Param('uuid') uuid: string,
  ): Promise<any> {
    let transaction;
    let actions = [];

    transaction = await this.transactionsService.findOneByParams({ uuid });

    try {
      actions = await this.messagingService.getActions(transaction);
    } catch (e) {
      console.error(`Error occured while getting transaction actions: ${e.message}`);
      actions = [];
    }

    return { ...transaction, actions };
  }

  @Post(':uuid/action/:action')
  @HttpCode(HttpStatus.OK)
  public async runAction(
    @Param('uuid') uuid: string,
    @Param('action') action: string,
    @Body() actionPayload: ActionPayloadDto,
  ): Promise<any> {
    let transaction: any;
    let updatedTransaction: any;

    this.dtoValidation.checkFileUploadDto(actionPayload);
    transaction = await this.transactionsService.findOne(uuid);

    try {
      updatedTransaction = await this.messagingService.runAction(transaction, action, actionPayload);
    } catch (e) {
      console.log('Error occured during running action:\n', e);
      throw new BadRequestException(e.message);
    }

    // Send update to php
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occured while sending transaction update: ${e.message}`);
    }

    try {
      await this.messagingService.getActions(updatedTransaction);
    } catch (e) {
      console.error(`Error occured while getting transaction actions: ${e.message}`);
    }

    return updatedTransaction;
  }

  @Get(':uuid/update-status')
  @HttpCode(HttpStatus.OK)
  public async updateStatus(
    @Param('uuid') uuid: string,
  ): Promise<any> {
    let transaction: any;
    let updatedTransaction: any;
    let actions: any[];

    transaction = await this.transactionsService.findOne(uuid);

    try {
      await this.messagingService.updateStatus(transaction);
    } catch (e) {
      console.error(`Error occured during status update: ${e}`);
      throw new BadRequestException(`Error occured during status update. Please try again later.`);
    }

    try {
      updatedTransaction = await this.transactionsService.findOneByParams({ uuid });
    } catch (e) {
      throw new NotFoundException();
    }

    // Send update to php
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occured while sending transaction update: ${e.message}`);
    }

    try {
      actions = await this.messagingService.getActions(transaction);
    } catch (e) {
      console.error(`Error occured while getting transaction actions: ${e.message}`);
      actions = [];
    }

    return { ...updatedTransaction, actions };
  }

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  public async getSettings(
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
