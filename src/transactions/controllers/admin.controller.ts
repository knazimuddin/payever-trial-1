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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { ParamModel } from '@pe/nest-kit';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import { TransactionPaymentDetailsConverter } from '../converter';
import { PagingResultDto, SortDto } from '../dto';
import { ActionPayloadDto } from '../dto/action-payload';
import { ActionItemInterface } from '../interfaces';
import {
  TransactionUnpackedDetailsInterface,
  TransactionWithAvailableActionsInterface,
} from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { TransactionSchemaName } from '../schemas';
import { DtoValidationService, ElasticSearchService, MessagingService, TransactionsService } from '../services';

// TODO: unify with business controller
@Controller('admin')
@ApiUseTags('admin')
@UseGuards(JwtAuthGuard)
@Roles(RolesEnum.admin)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
export class AdminController {

  constructor(
    private readonly dtoValidation: DtoValidationService,
    private readonly transactionsService: TransactionsService,
    private readonly searchService: ElasticSearchService,
    private readonly messagingService: MessagingService,
    private readonly logger: Logger,
  ) {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
  public async getList(
    @Query('orderBy') orderBy: string = 'created_at',
    @Query('direction') direction: string = 'asc',
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
    @Query('query') search: string,
    @Query('filters') filters: any = {},
    @Query('currency') currency: string,
  ): Promise<PagingResultDto> {
    const sort: SortDto = new SortDto(orderBy, direction);

    return this.searchService.getResult(filters, sort, search, +page, +limit, currency);
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
  ): Promise<TransactionWithAvailableActionsInterface>  {
    let actions: ActionItemInterface[] = [];
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    try {
      actions = await this.messagingService.getActionsList(unpackedTransaction);
    } catch (e) {
      this.logger.error(`Error occured while getting transaction actions: ${e.message}`);
      actions = [];
    }

    return { ...unpackedTransaction, actions };
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
  ): Promise<TransactionWithAvailableActionsInterface> {
    let actions: ActionItemInterface[] = [];
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    try {
      actions = await this.messagingService.getActionsList(unpackedTransaction);
    } catch (e) {
      this.logger.error(`Error occured while getting transaction actions: ${e.message}`);
      actions = [];
    }

    return { ...unpackedTransaction, actions };
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
  ): Promise<TransactionWithAvailableActionsInterface> {
    let actions: ActionItemInterface[];

    this.dtoValidation.checkFileUploadDto(actionPayload);
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    try {
      await this.messagingService.runAction(unpackedTransaction, action, actionPayload);
    } catch (e) {
      this.logger.log('Error occured during running action:\n', e);
      throw new BadRequestException(e.message);
    }

    const updatedTransaction: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByUuid(transaction.uuid);
    // Send update to checkout-php
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occured while sending transaction update: ${e.message}`);
    }

    try {
      actions = await this.messagingService.getActionsList(updatedTransaction);
    } catch (e) {
      this.logger.error(`Error occured while getting transaction actions: ${e.message}`);
      actions = [];
    }

    return { ...updatedTransaction, actions };
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
  ): Promise<TransactionWithAvailableActionsInterface> {
    let actions: ActionItemInterface[];

    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    try {
      await this.messagingService.updateStatus(unpackedTransaction);
    } catch (e) {
      this.logger.error(`Error occured during status update: ${e}`);
      throw new BadRequestException(`Error occured during status update. Please try again later.`);
    }

    const updatedTransaction: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByUuid(transaction.uuid);
    // Send update to checkout-php
    try {
      await this.messagingService.sendTransactionUpdate(updatedTransaction);
    } catch (e) {
      throw new BadRequestException(`Error occured while sending transaction update: ${e.message}`);
    }

    try {
      actions = await this.messagingService.getActionsList(updatedTransaction);
    } catch (e) {
      this.logger.error(`Error occured while getting transaction actions: ${e.message}`);
      actions = [];
    }

    return { ...updatedTransaction, actions };
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
