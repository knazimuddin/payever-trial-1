import { Injectable } from '@nestjs/common';
import { EventListener } from '@pe/nest-kit';
import { PaymentActionEventEnum } from '../enum/events';
import { BusinessPaymentOptionModel, TransactionModel } from '../models';
import { BusinessPaymentOptionService } from '../services';
import { ActionPayloadDto } from '../dto/action-payload';
import { PaymentActionsEnum, PaymentTypesEnum } from '../enum';

@Injectable()
export class BeforeActionEventListener {
  constructor(
    private readonly bpoService: BusinessPaymentOptionService,
  ) { }

  @EventListener(PaymentActionEventEnum.PaymentActionBefore)
  public async handlePaymentActionBefore(
    transaction: TransactionModel,
    actionPayload: ActionPayloadDto,
    action: string,
  ): Promise<void> {
    const allowedPaymentTypes: string[] =
      [PaymentTypesEnum.santanderSeInstallment, PaymentTypesEnum.santanderPosSeInstallment];

    if (!(allowedPaymentTypes.includes(transaction.type)
      && action === PaymentActionsEnum.ShippingGoods)
    ) {
      return;
    }

    const bpo: BusinessPaymentOptionModel = await this.bpoService.findOneByBusinessAndPaymentType(
      transaction.business_uuid,
      PaymentTypesEnum.payExCreditCard,
    );

    if (bpo && bpo.credentials) {
      actionPayload.payex_credentials = bpo.credentials;
    }
  }
}
