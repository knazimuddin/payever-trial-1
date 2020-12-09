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
export class ActionAmountRefundValidatorService implements ActionAmountValidatorInterface {
  public async validate(
    transaction: TransactionPackedDetailsInterface,
    amount: number,
    action: string,
  ): Promise<void> {
    if (action !== PaymentActionsEnum.Refund) {
      return;
    }

    const allowedRefundAmount: number =
      transaction.total - transaction.amount_refunded;

    if (amount > allowedRefundAmount) {
      throw new BadRequestException(`Amount is higher than allowed refund amount`);
    }
  }
}
