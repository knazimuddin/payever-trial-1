import { HttpService, Injectable, Logger, HttpException } from '@nestjs/common';
import { ActionCallerInterface, ActionItemInterface } from '../interfaces';
import { ActionPayloadInterface } from '../interfaces/action-payload';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { TransactionsService } from './transactions.service';
import { environment } from '../../environments';
import { Observable } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { catchError, map } from 'rxjs/operators';
import { ThirdPartyPaymentActionsEnum } from '../enum';

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
    let actions: ActionItemInterface[] = [];

    const actionPayload: ActionPayloadInterface = {
      paymentId: transaction.uuid,
    };

    const actionsResponse: { [key: string]: boolean } =
      await this.runThirdPartyAction(transaction, ThirdPartyPaymentActionsEnum.actionList, actionPayload);

    if (Object.keys(actionsResponse).length) {
      actions = Object.keys(actionsResponse)
        .map(
          (key: string) => ({
            action: key,
            enabled: actionsResponse[key],
          }),
        );
    }

    return actions;
  }

  public async runAction(
    transaction: TransactionUnpackedDetailsInterface,
    action: string,
    actionPayload: ActionPayloadInterface,
  ): Promise<void> {
    actionPayload.paymentId = transaction.uuid;

    await this.runThirdPartyAction(transaction, action, actionPayload);
  }

  private async runThirdPartyAction(
    transaction: TransactionUnpackedDetailsInterface,
    action: string,
    actionPayload?: ActionPayloadInterface,
  ): Promise<{}> {
    const businessId: string = transaction.business_uuid;
    const integrationName: string = transaction.type;

    const url: string =
      `${environment.thirdPartyPaymentsMicroUrlBase}/api/business/${businessId}/integration/${integrationName}/action/${action}`;

    this.logger.log({
      data: actionPayload,
      message: 'Starting third party payment action call',
      url: url,
    });

    const response: Observable<AxiosResponse<any>> = this.httpService.post(url, actionPayload);

    return response.pipe(
        map((res: any) => {
          this.logger.log({
            data: actionPayload,
            message: 'Received response from third party payment action call',
            response: res.data,
            url: url,
          });

          return res.data;
        }),
        catchError((error: AxiosError) => {
          this.logger.error({
            data: actionPayload,
            error: error.response.data,
            message: 'Failed response from third party payment action call',
            url: url,
          });

          throw new HttpException(error.response.data.message, error.response.data.code);
        }),
      )
      .toPromise();
  }
}
