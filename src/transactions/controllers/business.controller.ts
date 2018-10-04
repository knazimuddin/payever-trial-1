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
} from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { ApiUseTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { snakeCase } from 'lodash';
import { Observable, of } from 'rxjs';
import { map, tap, timeout, catchError, take } from 'rxjs/operators';

import { RabbitmqClient } from '@pe/nest-kit/modules/rabbitmq';
import { MessageBusService } from '@pe/nest-kit/modules/message';
import { ActionPayloadDto } from '../dto';

import { TransactionsService, MicroRoutingService, MessagingService } from '../services';
import { environment } from '../../environments';

@Controller('business/:businessUuid')
@ApiUseTags('business')
@ApiBearerAuth()
@ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.'})
@ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.'})
export class BusinessController {

  rabbitClient: ClientProxy;

  private messageBusService: MessageBusService = new MessageBusService({
    rsa: environment.rsa,
  });

  constructor(
    private readonly transactionsService: TransactionsService,
    // private readonly microRoutingService: MicroRoutingService,
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
        console.log('findOne');
        const transaction = await this.transactionsService.findOne(uuid);

        console.log('create payload');
        const payload = {
          action: 'action.list',
          data: this.createPayloadData(transaction),
        };

        console.log('create micro msg');
        const message = this.messageBusService.createPaymentMicroMessage(transaction.type, 'action', payload, !environment.production);

        console.log('rabbit send');

        // let response: string;

        // setTimeout(() => {
          // if (!response) reject('RPC Timeout');
        // }, 10000);

        // response = await this.rabbitClient.send(
          // // { channel: this.microRoutingService.getChannelByPaymentType(transaction.type) },
          // { channel: this.messageBusService.getChannelByPaymentType(transaction.type, !environment.production) },
          // message,
        // ).toPromise();

        console.log('got response');
        // const unwrappedMessage = this.messageBusService.unwrapRpcMessage(response);

        // const actions = Object.keys(unwrappedMessage).map((key) => ({
          // action: key,
          // enabled: actions[key],
        // }));

        // resolve({ ...transaction, actions });

        await this.rabbitClient.send(
          // { channel: this.microRoutingService.getChannelByPaymentType(transaction.type) },
          { channel: this.messageBusService.getChannelByPaymentType(transaction.type, !environment.production) },
          message,
        ).pipe(
          take(1),
          // timeout(20000),
          // catchError(error => of(`Request timed out after 20000`)),
          map((m) => this.messageBusService.unwrapRpcMessage(m)),
          tap((m) => console.log('unwrapped message', m)),
          map((actions) => {
            return Object.keys(actions).map((key) => ({
              action: key,
              enabled: actions[key],
            }));
          }),
          tap((actions) => console.log('tap', actions)),
        ).subscribe((actions) => {
          resolve({ ...transaction, actions });
        });

      } catch (error) {
        reject(new InternalServerErrorException(error));
      }
    });
  }

  @Post(':uuid/action/:action')
  @HttpCode(HttpStatus.OK)
  // @ApiResponse({status: HttpStatus.OK, description: 'The records have been successfully fetched.', type: GetTodoDto})
  async runAction(
    @Param('uuid') uuid: string,
    @Param('action') action: string,
    @Body() actionPayload: ActionPayloadDto,
  ): Promise<any> {
    return new Promise(async(resolve, reject) => {
      let transaction: any;
      let credentials: any;

      try {
        transaction = await this.transactionsService.findOne(uuid);
      } catch(e) {
        throw new InternalServerErrorException(`could not retrieve transaction: ${e}`);
      }

      try {
        credentials = await this.messagingService.getCredentials(transaction);
      } catch(e) {
        throw new InternalServerErrorException(`could not retrieve credentials: ${e}`);
      }

      try {
        console.log('action fields', actionPayload);

        const dto = this.createPayloadData(transaction);
        dto.action = 'cancel';

        if (actionPayload.fields) {
          dto.fields = actionPayload.fields;
        }

        if (actionPayload.files) {
          dto.files = actionPayload.files;
        }

        dto.credentials = credentials;

        const payload = {
          action: 'action.do',
          data: dto,
        };

        this.rabbitClient.send(
          { channel: this.messageBusService.getChannelByPaymentType(transaction.type, !environment.production) },
          this.messageBusService.createPaymentMicroMessage(transaction.type, 'action', payload, !environment.production),
        ).pipe(
          map((m) => this.messageBusService.unwrapRpcMessage(m)),
          // tap((m) => console.log('unwrapped message', m)),
          map((actions) => {
            return Object.keys(actions).map((key) => ({
              action: key,
              enabled: actions[key],
            }));
          }),
          // tap((reply) => console.log('tap', reply)),
          tap((reply) => {
            // @TODO save results???
            // this.transactionsService.update({...transaction,
              // status: '???'
            // });
          }),
        ).subscribe((reply) => {
          resolve({ ...transaction, reply });
        });

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

  private createPayloadData(transaction: any): any {
    this.fixDates(transaction);
    this.fixId(transaction);
    transaction.address = transaction.billing_address;
    // @TODO this should be done on BE side
    transaction.reference = transaction.uuid;

    try {
      transaction.payment_details = JSON.parse(transaction.payment_details);
    } catch(e) {
    }

    return {
      payment: transaction,
      payment_details: transaction.payment_details,
      business: {
        id: 1 // dummy id - php guys say it doesnot affect anything... but can we trust it?)
      },
    };
  }

  private fixDates(transaction) {
    Object.keys(transaction).forEach((key) => {
      if (transaction[key] instanceof Date) {
        // @TODO fix time shift issues
        transaction[key] = transaction[key].toISOString().split('.')[0] + "+00:00";
      }
    });
  }

  private fixId(transaction) {
    transaction.id = transaction.original_id;
  }

}
