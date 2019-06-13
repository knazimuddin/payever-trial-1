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
import { TransactionOutputConverter } from '../converter';
import { TransactionPaymentDetailsConverter } from '../converter/transaction-payment-details.converter';
import { PagingResultDto } from '../dto';
import { ActionPayloadDto } from '../dto/action-payload';
import { TransactionOutputInterface, TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { TransactionSchemaName } from '../schemas';
import {
  ActionsRetriever,
  DtoValidationService,
  MessagingService,
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
    private readonly dtoValidation: DtoValidationService,
    private readonly transactionsService: TransactionsService,
    private readonly transactionsGridService: TransactionsGridService,
    private readonly messagingService: MessagingService,
    private readonly actionsRetriever: ActionsRetriever,
    private readonly logger: Logger,
  ) {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
  public async getList(
    @Query('orderBy') orderBy: string = 'created_at',
    @Query('direction') direction: string = 'asc',
    @Query('limit') limit: number = 3,
    @Query('page') page: number = 1,
    @Query('query') search: string,
    @Query('filters') filters: any = {},
    @Query('currency') currency: string,
  ): Promise<PagingResultDto> {
    return this.transactionsGridService
      .getList(filters, orderBy, direction, search, +page, +limit, currency);
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
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    return TransactionOutputConverter.convert(
      unpackedTransaction,
      await this.actionsRetriever.retrieve(unpackedTransaction),
    );
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
    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    return TransactionOutputConverter.convert(
      unpackedTransaction,
      await this.actionsRetriever.retrieve(unpackedTransaction),
    );
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
          message: `Error occured during running action`,
          error: e.message,
          context: 'AdminController',
        },
      );
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
          message: `Error occured during status update`,
          error: e.message,
          context: 'AdminController',
        },
      );

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
      id: null, // 9???
      limit: '',
      order_by: '',
    };
  }
}
