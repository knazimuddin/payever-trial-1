import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { TransactionCartItemModel } from '../models';

@Injectable()
export class TransactionCartItemAmountCalculator {

  public static calculate(
    cartitems: Types.DocumentArray<TransactionCartItemModel>,
  ): number {
    let amount: number = 0;

    for (const item of cartitems) {
      amount += (item.price * item.quantity);
    }

    return amount;
  }
}
