import { Injectable, BadRequestException } from '@nestjs/common';
import { ServiceTag } from '@pe/nest-kit';
import { ACTION_AMOUNT_VALIDATOR } from '../../../constants';
import {
  ActionAmountValidatorInterface,
  TransactionPackedDetailsInterface,
} from '../../../interfaces';

@Injectable()
@ServiceTag(ACTION_AMOUNT_VALIDATOR)
export class ActionAmountTransactionValidatorService implements ActionAmountValidatorInterface {
  public async validate(
    transaction: TransactionPackedDetailsInterface,
    amount: number,
    action: string,
  ): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException(`Amount should be positive value`);
    }

    if (amount > transaction.total) {
      throw new BadRequestException(`Amount cannot be higher than transaction total amount`);
    }
  }
}
