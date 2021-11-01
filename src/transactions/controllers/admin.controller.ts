import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParamModel, QueryDto } from '@pe/nest-kit';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import { TransactionOutputConverter, TransactionPaymentDetailsConverter } from '../converter';
import { ListQueryDto, PagingResultDto } from '../dto';
import { ActionPayloadDto } from '../dto/action-payload';
import { TransactionOutputInterface, TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { TransactionSchemaName } from '../schemas';
import {
  ActionsRetriever,
  ElasticSearchService,
  MessagingService,
  MongoSearchService,
  TransactionActionService,
  TransactionsService,
} from '../services';
import { IsNotExampleFilter } from '../tools';
import { ConfigService } from '@nestjs/config';

@Controller('admin')
@ApiTags('admin')
@UseGuards(JwtAuthGuard)
@Roles(RolesEnum.admin)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class AdminController {
  private readonly defaultCurrency: string;

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly mongoSearchService: MongoSearchService,
    private readonly elasticSearchService: ElasticSearchService,
    private readonly messagingService: MessagingService,
    private readonly actionsRetriever: ActionsRetriever,
    private readonly transactionActionService: TransactionActionService,
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    this.defaultCurrency = this.configService.get<string>('DEFAULT_CURRENCY');
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  public async getList(
    @QueryDto() listDto: ListQueryDto,
  ): Promise<PagingResultDto> {
    listDto.filters = IsNotExampleFilter.apply(listDto.filters);
    listDto.currency = this.defaultCurrency;

    return this.elasticSearchService.getResult(listDto);
  }

  @Get('mongo')
  @HttpCode(HttpStatus.OK)
  public async getMongo(
    @QueryDto() listDto: ListQueryDto,
  ): Promise<PagingResultDto> {
    listDto.filters = IsNotExampleFilter.apply(listDto.filters);
    listDto.currency = this.defaultCurrency;

    return this.mongoSearchService.getResult(listDto);
  }

  @Get('detail/reference/:reference')
  @HttpCode(HttpStatus.OK)
  public async getDetailByReference(
    @ParamModel(
      {
        reference: ':reference',
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
  ): Promise<TransactionOutputInterface>  {
    return this.getDetails(transaction);
  }

  @Get('detail/:uuid')
  @HttpCode(HttpStatus.OK)
  public async getDetail(
    @ParamModel(
      {
        uuid: ':uuid',
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
  ): Promise<TransactionOutputInterface> {
    return this.getDetails(transaction);
  }

  @Post(':uuid/action/:action')
  @HttpCode(HttpStatus.OK)
  public async runAction(
    @Param('action') action: string,
    @ParamModel(
      {
        uuid: ':uuid',
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
    @Body() actionPayload: ActionPayloadDto,
  ): Promise<TransactionOutputInterface> {
    const updatedTransaction: TransactionUnpackedDetailsInterface = await this.transactionActionService.doAction(
        transaction,
        actionPayload,
        action,
    );

    return TransactionOutputConverter.convert(
      updatedTransaction,
      await this.actionsRetriever.retrieve(updatedTransaction),
    );
  }

  @Get(':uuid/update-status')
  @HttpCode(HttpStatus.OK)
  public async updateStatus(
    @ParamModel(
      {
        uuid: ':uuid',
      },
      TransactionSchemaName,
    ) transaction: TransactionModel,
  ): Promise<TransactionOutputInterface> {
    const updatedTransaction: TransactionUnpackedDetailsInterface =
      await this.transactionActionService.updateStatus(transaction);

    return TransactionOutputConverter.convert(
      updatedTransaction,
      await this.actionsRetriever.retrieve(updatedTransaction),
    );
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
      id: null,
      limit: '',
      order_by: '',
    };
  }

  private async getDetails(transaction: TransactionModel): Promise<TransactionOutputInterface>  {
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    return TransactionOutputConverter.convert(
      unpackedTransaction,
      await this.actionsRetriever.retrieve(unpackedTransaction),
    );
  }
}
