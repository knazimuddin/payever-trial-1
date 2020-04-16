import { HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IntercomService } from '@pe/nest-kit';
import { AxiosError, AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { ThirdPartyPaymentActionsEnum, TransactionActionsToThirdPartyActions } from '../enum';
import { ActionCallerInterface, ActionItemInterface } from '../interfaces';
import { ActionPayloadInterface } from '../interfaces/action-payload';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { TransactionsService } from './transactions.service';

@Injectable()
export class ThirdPartyCallerService implements ActionCallerInterface {
  private thirdPartyPaymentsMicroUrl: string;
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly httpService: IntercomService,
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    this.thirdPartyPaymentsMicroUrl = this.configService.get<string>('MICRO_URL_THIRD_PARTY_PAYMENTS');
  }

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
    if (!TransactionActionsToThirdPartyActions.has(action.toLowerCase())) {
      throw new NotFoundException(`Action ${action} is not supported`);
    }

    action = TransactionActionsToThirdPartyActions.get(action.toLowerCase());
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
      `${this.thirdPartyPaymentsMicroUrl}`
        + `/api/business/${businessId}/integration/${integrationName}/action/${action}`;

    this.logger.log({
      data: actionPayload,
      message: 'Starting third party payment action call',
      url: url,
    });

    const response: Observable<AxiosResponse<any>> = await this.httpService.post(url, actionPayload);

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