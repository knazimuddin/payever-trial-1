import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import { RabbitmqClient } from '@pe/nest-kit/modules/rabbitmq';
import { snakeCase } from 'lodash';
import { environment } from '../../environments';

import { ActionPayloadDto } from '../dto';

import {
  BusinessPaymentOptionService,
  MessagingService,
  TransactionsGridService,
  TransactionsService,
} from '../services';

@Controller('business/:businessId')
@ApiUseTags('business')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class BusinessController {

  private rabbitClient: ClientProxy;

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly transactionsGridService: TransactionsGridService,
    private readonly bpoService: BusinessPaymentOptionService,
    private readonly messagingService: MessagingService,
  ) {
    this.rabbitClient = new RabbitmqClient(environment.rabbitmq);
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

    const sort = {};
    sort[snakeCase(orderBy)] = direction.toLowerCase();

    return Promise
      .all([
        this.transactionsGridService.findMany(filters, sort, search, +page, +limit),
        this.transactionsGridService.count(filters, search),
        this.transactionsGridService.total(filters, search),
      ])
      .then((res) => {
        return {
          collection: res[0],
          pagination_data: {
            totalCount: res[1],
            total: res[2],
            current: page,
          },
          filters: {},
          usage: {},
        };
      });
  }

  @Get('detail/reference/:reference')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  public async getDetailByReference(@Param('reference') reference: string) {
    const transaction = await this.transactionsService.findOneByParams({ reference });
    if (!transaction) {
      throw new NotFoundException();
    }

    return { ...transaction };
  }

  @Get('detail/:uuid')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  public async getDetail(
    @Param('uuid') uuid: string,
    @Headers() headers: any,
  ): Promise<any> {
    let transaction;
    let actions;

    try {
      transaction = await this.transactionsService.findOneByParams({ uuid });
    } catch (e) {
      throw new NotFoundException();
    }

    if (!transaction) {
      throw new NotFoundException();
    }

    try {
      actions = await this.messagingService.getActions(transaction, headers);
    } catch (e) {
      console.error(`Error occured while getting transaction actions: ${e}`);
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
    @Body() actionPayload: ActionPayloadDto,
    @Headers() headers: any,
  ): Promise<any> {
    let transaction: any;
    let updatedTransaction: any;
    let actions: any;

    try {
      transaction = await this.transactionsService.findOne(uuid);
    } catch (e) {
      throw new NotFoundException();
    }

    try {
      updatedTransaction = await this.messagingService.runAction(transaction, action, actionPayload, headers);
    } catch (e) {
      console.log('Error occured during running action:\n', e);
      throw new BadRequestException(e);
    }

    // Send update to php
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occured while sending transaction update: ${e}`);
    }

    try {
      await this.messagingService.getActions(updatedTransaction, headers);
    } catch (e) {
      console.error(`Error occured while getting transaction actions: ${e}`);
    }

    return updatedTransaction;
  }

  @Get(':uuid/update-status')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant)
  public async updateStatus(
    @Param('uuid') uuid: string,
    @Headers() headers: any,
  ): Promise<any> {
    let transaction: any;
    let updatedTransaction: any;
    let actions: any;

    try {
      transaction = await this.transactionsService.findOne(uuid);
    } catch (e) {
      throw new NotFoundException();
    }

    try {
      await this.messagingService.updateStatus(transaction, headers);
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
      throw new BadRequestException(`Error occured while sending transaction update: ${e}`);
    }

    try {
      actions = await this.messagingService.getActions(transaction, headers);
    } catch (e) {
      console.error(`Error occured while getting transaction actions: ${e}`);
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
