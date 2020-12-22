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
    const roundedAllowedCaptureAmount: number =
      Math.round((allowedCaptureAmount + Number.EPSILON) * 100) / 100;

    if (amount > roundedAllowedCaptureAmount) {
      throw new BadRequestException(`Amount is higher than allowed capture amount`);
    }
  }
}
