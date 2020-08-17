import { Injectable } from '@nestjs/common';
import { EventListener } from '@pe/nest-kit';
import { PaymentActionEventEnum } from '../enum/events';
import { BusinessPaymentOptionModel, TransactionModel } from '../models';
import { BusinessPaymentOptionService } from '../services';
import { ActionPayloadDto, FieldsDto } from '../dto/action-payload';
import { PaymentActionsEnum, PaymentTypesEnum } from '../enum';

@Injectable()
export class BeforeSantanderSeShippingGoodsEventListener {
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

    const bpo: BusinessPaymentOptionModel = await this.bpoService.findOneByBusinessAndPaymentTypeAndEnabled(
      transaction.business_uuid,
      PaymentTypesEnum.payExCreditCard,
    );

    if (bpo && bpo.credentials) {
      if (!actionPayload.fields) {
        actionPayload.fields = { } as FieldsDto;
      }
      actionPayload.fields.payex_credentials = bpo.credentials;
    }
  }
}
