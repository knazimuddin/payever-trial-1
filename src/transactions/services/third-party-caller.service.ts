import { HttpService, Injectable, Logger } from '@nestjs/common';
import { ActionCallerInterface, ActionItemInterface } from '../interfaces';
import { ActionPayloadInterface } from '../interfaces/action-payload';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { TransactionsService } from './transactions.service';

@Injectable()
export class ThirdPartyCallerService implements ActionCallerInterface {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly httpService: HttpService,
    private readonly logger: Logger,
  ) {}

  public async getActionsList(
    transaction: TransactionUnpackedDetailsInterface,
  ): Promise<ActionItemInterface[]> {
    const actions: ActionItemInterface[] = [];
    // TODO: implement

    return actions;
  }

  public async runAction(
    transaction: TransactionUnpackedDetailsInterface,
    action: string,
    actionPayload: ActionPayloadInterface,
  ): Promise<void> {
    // TODO: implement
  }
}
