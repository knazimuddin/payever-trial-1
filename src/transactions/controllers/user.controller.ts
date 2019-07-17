import { Controller, Get, HttpCode, HttpStatus, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { ParamModel, QueryDto } from '@pe/nest-kit';
import { JwtAuthGuard, Roles, RolesEnum, User, UserTokenInterface } from '@pe/nest-kit/modules/auth';
import { TransactionOutputConverter } from '../converter';
import { ListQueryDto, PagingResultDto } from '../dto';
import { ActionItemInterface } from '../interfaces';
import { TransactionOutputInterface, TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
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
    @QueryDto() listDto: ListQueryDto,
  ): Promise<PagingResultDto> {
    listDto.filters = UserFilter.apply(user.id, listDto.filters);

    return this.searchService.getResult(listDto);
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
  ): Promise<TransactionOutputInterface> {
    const actions: ActionItemInterface[] = [];
    const found: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByParams({ uuid: transaction.uuid, user_uuid: user.id });

    if (!found) {
      throw new NotFoundException(`Transaction not found.`);
    }

    return TransactionOutputConverter.convert(found, actions);
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
