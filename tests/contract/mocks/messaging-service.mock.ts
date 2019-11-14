import {MessagingService} from "../../../src/transactions/services";
import {TransactionUnpackedDetailsInterface} from "../../../src/transactions/interfaces/transaction";
import {ActionItemInterface} from "../../../src/transactions/interfaces";

export class MessagingServiceMock extends MessagingService {
  public async getActionsList(
    transaction: TransactionUnpackedDetailsInterface,
  ): Promise<ActionItemInterface[]> {
    return [
      {
        action: 'refund',
        enabled: true,
      },
    ];
  }
}
