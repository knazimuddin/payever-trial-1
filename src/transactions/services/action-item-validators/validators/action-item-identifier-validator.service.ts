import { Injectable, BadRequestException } from '@nestjs/common';
import { ServiceTag } from '@pe/nest-kit';
import { ACTION_ITEM_VALIDATOR } from '../../../constants';
import {
  ActionItemValidatorInterface,
  TransactionCartItemInterface,
  TransactionPackedDetailsInterface,
} from '../../../interfaces';

@Injectable()
@ServiceTag(ACTION_ITEM_VALIDATOR)
export class ActionItemIdentifierValidator implements ActionItemValidatorInterface{
  public async validate(
    transaction: TransactionPackedDetailsInterface,
    item: TransactionCartItemInterface,
  ): Promise<void> {
    const identifier: string = item.identifier;
    if (!identifier) {
      throw new BadRequestException(`Identifier is missing for payment item ${item.name}`);
    }
  }
}
