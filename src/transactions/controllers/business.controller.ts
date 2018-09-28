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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiUseTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { snakeCase } from 'lodash';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { RabbitmqClient } from '@pe/nest-kit/modules/rabbitmq';
import { MessageFactory, MessageBusService } from '@pe/nest-kit/modules/message';

import { TransactionsService } from '../services';
import { environment } from '../../environments';

@Controller('business/:businessUuid')
@ApiUseTags('business')
@ApiBearerAuth()
@ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.'})
@ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.'})
export class BusinessController {

  rabbitClient: ClientProxy;

  private messageFactory: MessageFactory = new MessageFactory();
  private messageBusService: MessageBusService = new MessageBusService({
    rsa: environment.rsa,
  });

  constructor(private readonly transactionsService: TransactionsService) {
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

      console.log('page:', page);
      console.log('limit:', limit);
      console.log('orderBy:', orderBy);
      console.log('direction:', direction);
      console.log('filters:', filters);
      console.log('search:', search);

      filters.business_uuid = {
        condition: 'is',
        value: businessUuid,
      };

      // console.log('input filters', filters);


      // const filtersWithBusiness = {
        // ...filters
        // business_uuid: businessUuid,
      // };

      console.log();
      const sort = {};
      sort[snakeCase(orderBy)] = direction.toLowerCase();

      return Promise.all([
        this.transactionsService.findMany(filters, sort, search, +page, +limit),
        this.transactionsService.count(filters, search),
        this.transactionsService.total(filters, search),
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
    return new Promise(async(resolve, reject) => {
      try {
        const transaction = await this.transactionsService.findOne(uuid);

        resolve(transaction);

        /*
        this.fixDates(transaction);

        const actionsPayload = {
          action: 'action.list',
          data: {
            payment: transaction,
            business: {
              id: 1 // dummy id
            },
          },
        };

        this.rabbitClient.send(
          { event: 'rpc_payment_santander_de' }, // hardcoded!
          this.messageFactory.createMessage('payment_option.santander_installment.action', actionsPayload),
        ).pipe(
          map((m) => this.messageBusService.unwrapMessage(m)),
          map((actionsResponse) => {
            console.log(actionsResponse);
            const actions = JSON.parse(actionsResponse.payload).result; // move json parse into transport layer
            return Object.keys(actions).map((key) => ({
              action: key,
              enabled: actions[key],
            }));
          }),
          tap((actions) => console.log('tap', actions)),
        ).subscribe((actions) => {
          resolve({ ...transaction, actions });
        });
        */

      } catch (error) {
        throw error;
      }
    });
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

  private fixDates(transaction) {
    Object.keys(transaction).forEach((key) => {
      if (transaction[key] instanceof Date) {
        console.log('fixing date:', key);
        transaction[key] = transaction[key].toISOString().split('.')[0] + "+00:00";
      }
    });
  }

}
