import {
  BadRequestException,
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
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';
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
  DtoValidationService,
  ElasticSearchService,
  MessagingService,
  TransactionsService,
} from '../services';
import { environment } from '../../environments';

@Controller('admin')
@ApiUseTags('admin')
@UseGuards(JwtAuthGuard)
@Roles(RolesEnum.admin)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class AdminController {
  private defaultCurrency: string;

  constructor(
    private readonly dtoValidation: DtoValidationService,
    private readonly transactionsService: TransactionsService,
    private readonly searchService: ElasticSearchService,
    private readonly messagingService: MessagingService,
    private readonly actionsRetriever: ActionsRetriever,
    private readonly logger: Logger,
  ) {
    this.defaultCurrency = environment.defaultCurrency;
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  public async getList(
    @QueryDto() listDto: ListQueryDto,
  ): Promise<PagingResultDto> {
    listDto.currency = this.defaultCurrency;
    return this.searchService.getResult(listDto);
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
    this.dtoValidation.checkFileUploadDto(actionPayload);
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    try {
      await this.messagingService.runAction(unpackedTransaction, action, actionPayload);
    } catch (e) {
      this.logger.error(
        {
          context: 'AdminController',
          error: e.message,
          message: `Error occured during running action`,
        },
      );
      throw new BadRequestException(e.message);
    }

    const updatedTransaction: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByUuid(transaction.uuid);
    /** Send update to checkout-php */
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occured while sending transaction update: ${e.message}`);
    }

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
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    try {
      await this.messagingService.updateStatus(unpackedTransaction);
    } catch (e) {
      this.logger.error(
        {
          context: 'AdminController',
          error: e.message,
          message: `Error occured during status update`,
        },
      );

      throw new BadRequestException(`Error occured during status update. Please try again later.`);
    }

    const updatedTransaction: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByUuid(transaction.uuid);
    /** Send update to checkout-php */
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occured while sending transaction update: ${e.message}`);
    }

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
