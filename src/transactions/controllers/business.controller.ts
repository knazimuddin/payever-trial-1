import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { ApiUseTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { snakeCase } from 'lodash';
import { Observable, of } from 'rxjs';
import { map, tap, timeout, catchError, take } from 'rxjs/operators';

import { RabbitmqClient } from '@pe/nest-kit/modules/rabbitmq';
import { MessageBusService } from '@pe/nest-kit/modules/message';
import { ActionPayloadDto } from '../dto';

import { TransactionsService, TransactionsGridService, MessagingService } from '../services';
import { environment } from '../../environments';

@Controller('business/:businessUuid')
@ApiUseTags('business')
@ApiBearerAuth()
@ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.'})
@ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.'})
export class BusinessController {

  rabbitClient: ClientProxy;

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly transactionsGridService: TransactionsGridService,
    private readonly messagingService: MessagingService,
  ) {
    this.rabbitClient = new RabbitmqClient(environment.rabbitmq);
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  // @ApiResponse({status: HttpStatus.OK, description: 'The records have been successfully fetched.', type: GetTodoDto, isArray: true})
  async getList(
    @Param('businessUuid') businessUuid: string,
    @Query('orderBy') orderBy: string = 'created_at',
    @Query('direction') direction: string = 'asc',
    @Query('limit') limit: number = 3,
    @Query('page') page: number = 1,
    @Query('query') search: string,
    @Query('filters') filters: any = {},
  ): Promise<any> {
    try {
      filters.business_uuid = {
        condition: 'is',
        value: businessUuid,
      };

      const sort = {};
      sort[snakeCase(orderBy)] = direction.toLowerCase();

      return Promise.all([
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

    } catch (error) {
      throw error;
    }
  }

  @Get('detail/:uuid')
  @HttpCode(HttpStatus.OK)
  // @ApiResponse({status: HttpStatus.OK, description: 'The records have been successfully fetched.', type: GetTodoDto})
  async getDetail(
    @Param('uuid') uuid: string,
  ): Promise<any> {
    let transaction;
    let actions;

    try {
      transaction = await this.transactionsService.findOneByParams({uuid});
    } catch (e) {
      throw new NotFoundException();
    }

    if (!transaction) {
      throw new NotFoundException();
    }

    try {
      actions = await this.messagingService.getActions(transaction);
    } catch (e) {
      throw new BadRequestException(`Error occured while getting transaction actions: ${e}`);
    }

    return {...transaction, actions};
  }

  @Post(':uuid/action/:action')
  @HttpCode(HttpStatus.OK)
  // @ApiResponse({status: HttpStatus.OK, description: 'The records have been successfully fetched.', type: GetTodoDto})
  async runAction(
    @Param('uuid') uuid: string,
    @Param('action') action: string,
    @Body() actionPayload: ActionPayloadDto,
  ): Promise<any> {
    let transaction: any;
    let updatedTransaction: any;
    let actions: any;

    try {
      transaction = await this.transactionsService.findOne(uuid);
    } catch (e) {
      throw new NotFoundException();
    }

    if (transaction.action_running) {
      throw new BadRequestException(`Cannot run action now, another action is already in process.`);
    }

    try {
      this.transactionsService.updateByUuid(transaction.uuid, {action_running: true});
      updatedTransaction = await this.messagingService.runAction(transaction, action, actionPayload);
    } catch (e) {
      console.log('Error occured during running action', e);
      throw new BadRequestException(`Error occured during running action: ${e}`);
    } finally {
      this.transactionsService.updateByUuid(transaction.uuid, {action_running: false});
    }

    // Send update to php
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occured while sending transaction update: ${e}`);
    }

    try {
      actions = await this.messagingService.getActions(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occured while getting transaction actions: ${e}`);
    }

    return updatedTransaction;
  }

  @Get(':uuid/update-status')
  @HttpCode(HttpStatus.OK)
  // @ApiResponse({status: HttpStatus.OK, description: 'The records have been successfully fetched.', type: GetTodoDto})
  async updateStatus(
    @Param('uuid') uuid: string,
  ): Promise<any> {
    let transaction: any;
    let updatedTransaction: any;

    try {
      transaction = await this.transactionsService.findOne(uuid);
    } catch (e) {
      throw new NotFoundException();
    }

    try {
      updatedTransaction = await this.messagingService.updateStatus(transaction);
    } catch (e) {
      throw new BadRequestException(`Error occured during status update: ${e}`);
    }

    // Send update to php
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occured while sending transaction update: ${e}`);
    }

    return updatedTransaction;
  }

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  async getSettings(
    @Param('businessUuid') businessUuid: string,
  ): Promise<any> {
    return {
      columns_to_show : [
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
