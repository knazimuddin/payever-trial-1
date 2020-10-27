import { Injectable, BadRequestException } from '@nestjs/common';
import { ServiceTag } from '@pe/nest-kit';
import { ACTION_AMOUNT_VALIDATOR } from '../../../constants';
import {
  ActionAmountValidatorInterface,
  TransactionPackedDetailsInterface,
} from '../../../interfaces';
import { PaymentActionsEnum } from '../../../enum';

@Injectable()
@ServiceTag(ACTION_AMOUNT_VALIDATOR)
export class ActionAmountCaptureValidatorService implements ActionAmountValidatorInterface {
  public async validate(
    transaction: TransactionPackedDetailsInterface,
    amount: number,
    action: string,
  ): Promise<void> {
    if (action !== PaymentActionsEnum.ShippingGoods) {
      return;
    }

    const allowedCaptureAmount: number =
      transaction.total - transaction.amount_captured - transaction.amount_refunded;

    if (amount > allowedCaptureAmount) {
      throw new BadRequestException(`Amount is higher than allowed capture amount`);
    }
  }
}
