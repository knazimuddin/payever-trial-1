import {
  Controller,
  Get, Headers,
  HttpCode,
  HttpStatus, NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesEnum, User, UserTokenInterface } from '@pe/nest-kit/modules/auth';
import { snakeCase } from 'lodash';

import {
  TransactionsGridService,
  TransactionsService,
} from '../services';

@Controller('admin')
@ApiUseTags('admin')
@UseGuards(JwtAuthGuard)
@Roles(RolesEnum.admin)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class AdminController {

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly transactionsGridService: TransactionsGridService
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
  ): Promise<any> {
    return this.transactionsGridService.getList(filters, orderBy, direction, search, +page, +limit);
  }

  @Get('detail/:uuid')
  @HttpCode(HttpStatus.OK)
  public async getDetail(
    @User() user: UserTokenInterface,
    @Param('uuid') uuid: string,
  ): Promise<any> {
    let transaction;
    let actions = [];

    try {
      transaction = await this.transactionsService.findOneByParams({ uuid, user_uuid: user.id });
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
