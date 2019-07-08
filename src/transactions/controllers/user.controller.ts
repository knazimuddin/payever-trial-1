import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { ParamModel } from '@pe/nest-kit';
import { JwtAuthGuard, Roles, RolesEnum, User, UserTokenInterface } from '@pe/nest-kit/modules/auth';
import { PagingResultDto, SortDto } from '../dto';
import { ActionItemInterface } from '../interfaces';
import {
  TransactionUnpackedDetailsInterface,
  TransactionWithAvailableActionsInterface,
} from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { TransactionSchemaName } from '../schemas';
import { ElasticSearchService, TransactionsService } from '../services';
import { UserFilter } from '../tools';

@Controller('user')
@ApiUseTags('user')
@UseGuards(JwtAuthGuard)
@Roles(RolesEnum.user)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class UserController {

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly searchService: ElasticSearchService,
  ) {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
  public async getList(
    @User() user: UserTokenInterface,
    @Query('orderBy') orderBy: string = 'created_at',
    @Query('direction') direction: string = 'asc',
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
    @Query('query') search: string,
    @Query('filters') filters: any = {},
  ): Promise<PagingResultDto> {
    filters = UserFilter.apply(user.id, filters);
    const sort: SortDto = new SortDto(orderBy, direction);

    return this.searchService.getResult(filters, sort, search, +page, +limit);
  }

  @Get('detail/:uuid')
  @HttpCode(HttpStatus.OK)
  public async getDetail(
    @User() user: UserTokenInterface,
    @ParamModel(
      {
        uuid: ':uuid',
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
  ): Promise<TransactionWithAvailableActionsInterface> {
    const actions: ActionItemInterface[] = [];
    const found: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByParams({ uuid: transaction.uuid, user_uuid: user.id });

    if (!found) {
      throw new NotFoundException(`Transaction not found.`);
    }

    return { ...found, actions };
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
