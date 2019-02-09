import {
  Controller,
  Get, Headers,
  HttpCode,
  HttpStatus, NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesEnum, User, UserTokenInterface } from '@pe/nest-kit/modules/auth';
import { RabbitmqClient } from '@pe/nest-kit/modules/rabbitmq';
import { snakeCase } from 'lodash';
import { environment } from '../../environments';

import {
  TransactionsGridService,
  TransactionsService,
} from '../services';

@Controller('user')
@ApiUseTags('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class UserController {

  private rabbitClient: ClientProxy;

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly transactionsGridService: TransactionsGridService
  ) {
    this.rabbitClient = new RabbitmqClient(environment.rabbitmq);
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.user)
  public async getList(
    @User() user: UserTokenInterface,
    @Query('orderBy') orderBy: string = 'created_at',
    @Query('direction') direction: string = 'asc',
    @Query('limit') limit: number = 3,
    @Query('page') page: number = 1,
    @Query('query') search: string,
    @Query('filters') filters: any = {},
  ): Promise<any> {
    filters.user_uuid = {
      condition: 'is',
      value: user.id,
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

  @Get('detail/:uuid')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.user)
  public async getDetail(
    @Param('uuid') uuid: string,
    @Headers() headers: any,
  ): Promise<any> {
    let transaction;
    let actions = [];

    try {
      transaction = await this.transactionsService.findOneByParams({ uuid });
    } catch (e) {
      throw new NotFoundException();
    }

    if (!transaction) {
      throw new NotFoundException();
    }

    return { ...transaction, actions };
  }

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.user)
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
