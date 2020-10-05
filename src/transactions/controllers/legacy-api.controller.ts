import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { Acl, AclActionsEnum } from '@pe/nest-kit';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import { TransactionConverter, TransactionPaymentDetailsConverter } from '../converter';
import {
  TransactionUnpackedDetailsInterface
} from '../interfaces/transaction';
import { CheckoutTransactionInterface } from "../interfaces/checkout";
import { ActionItemInterface } from "../interfaces";
import { TransactionModel } from '../models';
import {
  ActionsRetriever,
  ElasticSearchService,
  MessagingService,
  MongoSearchService,
  TransactionsService,
} from '../services';

@Controller('legacy-api')
@ApiUseTags('legacy-api')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })

export class LegacyApiController {

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly mongoSearchService: MongoSearchService,
    private readonly elasticSearchService: ElasticSearchService,
    private readonly messagingService: MessagingService,
    private readonly actionsRetriever: ActionsRetriever
  ) { }

  @Get('transactions/:original_id')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.read })
  public async getTransactionById(
    @Param('original_id') transactionId: string,
  ): Promise<any>  {
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
      original_id: transactionId
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction by id ${transactionId} not found`);
    }

    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    const checkoutTransaction: CheckoutTransactionInterface = TransactionConverter.toCheckoutTransaction(unpackedTransaction);
    const actions: ActionItemInterface[] = !transaction.example
      ? await this.actionsRetriever.retrieve(unpackedTransaction)
      : this.actionsRetriever.retrieveFakeActions(unpackedTransaction);

    return Object.assign({ actions: actions }, checkoutTransaction);
  }
}
