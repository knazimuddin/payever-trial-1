import { Injectable, Logger } from '@nestjs/common';
import { Command, Positional } from '@pe/nest-kit';
import { NextActionTypesEnum, PaymentTypesEnum } from '../enum';
import { BusinessPaymentOptionService, MessagingService, TransactionsService } from '../services';
import { TransactionUnpackedDetailsInterface, UnpackedDetailsInterface } from '../interfaces/transaction';
import { NextActionDto } from '../dto';
import { BusinessPaymentOptionModel } from '../models';

@Injectable()
export class TriggerPayexCaptureCommand {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly bpoService: BusinessPaymentOptionService,
    private readonly messagingService: MessagingService,
  ) { }

  @Command({
    command: 'trigger:payex:capture',
    describe: 'Trigger payex capture manually by Santander SE transaction original id',
  })
  public async triggerPayexCapture(
    @Positional({
      name: 'original_id',
    }) originalId: string,
  ): Promise<void> {
    Logger.log(`Starting payex manual capture for original id ${originalId}`);

    const transaction: TransactionUnpackedDetailsInterface =
      await this.transactionsService.findUnpackedByParams({ original_id: originalId });
    if (!transaction) {
      Logger.error(`Transaction not found by original id ${originalId}`);

      return;
    }

    const allowedPaymentTypes: string[] =
      [PaymentTypesEnum.santanderSeInstallment, PaymentTypesEnum.santanderPosSeInstallment];

    if (!allowedPaymentTypes.includes(transaction.type)) {
      Logger.error(`Transaction is not supported with type ${transaction.type}`);

      return;
    }

    const paymentDetails: UnpackedDetailsInterface = transaction.payment_details;
    const authorizationCode: string = paymentDetails.authorization_code;

    if (!authorizationCode) {
      Logger.error(`Transaction cannot be captured, missing authorization_code`);

      return;
    }

    const payexBpo: BusinessPaymentOptionModel = await this.bpoService.findOneByBusinessAndPaymentTypeAndEnabled(
      transaction.business_uuid,
      PaymentTypesEnum.payExCreditCard,
    );

    if (!payexBpo || !payexBpo.credentials) {
      Logger.error(`Transaction cannot be captured, missing payex credentials`);

      return;
    }

    const nextActionDto: NextActionDto = {
      payload: {
        credentials: payexBpo.credentials,
        payment_id: originalId,
        total: transaction.total,
        transaction_number: authorizationCode,
      },
      payment_method: PaymentTypesEnum.payExCreditCard,
      type: NextActionTypesEnum.externalCapture,
    };

    try {
      await this.messagingService.runNextAction(transaction, nextActionDto);
      Logger.log(`Successfully finished payex manual capture for original id ${originalId}`);
    } catch (e) {
      Logger.error(`Failed payex manual capture for original id ${originalId} with error "${e.message}"`);
    }
  }
}
