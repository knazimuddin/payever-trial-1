import { HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntercomService } from '@pe/nest-kit';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ThirdPartyPaymentActionsEnum, TransactionActionsToThirdPartyActions } from '../enum';
import { ActionCallerInterface, ActionItemInterface } from '../interfaces';
import { ActionPayloadInterface } from '../interfaces/action-payload';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { TransactionsService } from './transactions.service';
import { InnerActionInterface } from '../../integration/interfaces';

@Injectable()
export class ThirdPartyCallerService implements ActionCallerInterface {
  private readonly thirdPartyPaymentsMicroUrl: string;
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

    const isActionOptionsListAllowed: boolean = await this.isActionOptionsListImplemented(transaction);

    if (isActionOptionsListAllowed) {
      actions = await this.runThirdPartyAction(
        transaction,
        ThirdPartyPaymentActionsEnum.actionOptionsList,
        actionPayload,
      );
    } else {
      const actionsResponse: { [key: string]: boolean } = await this.runThirdPartyAction(
        transaction,
        ThirdPartyPaymentActionsEnum.actionList,
        actionPayload,
      );

      if (Object.keys(actionsResponse).length) {
        actions = Object.keys(actionsResponse)
          .map(
            (key: string) => ({
              action: key,
              enabled: actionsResponse[key],
            }),
          );
      }
    }

    /**
     * This hack is only for FE improvement. FE for "Edit action" is not implemented in DK.
     * Thus we disable it here to prevent inconveniences.
     */
    if (transaction.type === 'santander_installment_dk') {
      actions = actions.filter((x: ActionItemInterface) => x.action !== 'edit');
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

    const result: any = await this.runThirdPartyAction(transaction, action, actionPayload);

    await this.updateTransactionFromThirdPartyResult(transaction, result);
  }

  public async updateStatus(
    transaction: TransactionUnpackedDetailsInterface,
  ): Promise<void> {
    const result: any = await this.runThirdPartyAction(
      transaction,
      ThirdPartyPaymentActionsEnum.actionUpdateStatus,
      { paymentId: transaction.uuid },
    );

    await this.updateTransactionFromThirdPartyResult(transaction, result);
  }

  public async downloadContract(
    transaction: TransactionUnpackedDetailsInterface,
  ): Promise<{ contentType: string, filenameWithExtension: string, base64Content: string }> {

    const url: string =
      `${this.thirdPartyPaymentsMicroUrl}`
      + `/api/download-resource/business/${transaction.business_uuid}/integration/${transaction.type}/action/contract?paymentId=${transaction.original_id}&rawData=true`;

    this.logger.log({
      message: 'Starting third party download contract action call',
      transaction: transaction.original_id,
      url: url,
    });

    const response: Observable<AxiosResponse<any>> = await this.httpService.get(url);

    return response.pipe(
      map((res: any) => {
        this.logger.log({
          message: 'Received response from third party download contract action call',
          transaction: transaction.original_id,
          url: url,
        });

        return res.data;
      }),
      catchError((error: AxiosError) => {
        this.logger.error({
          error: error.response.data,
          message: 'Failed response from third party download contract action call',
          transaction: transaction.original_id,
          url: url,
        });

        throw new HttpException(error.response.data.message, error.response.data.code);
      }),
    )
      .toPromise();
  }

  private async updateTransactionFromThirdPartyResult(
    transaction: TransactionUnpackedDetailsInterface,
    result: any,
  ): Promise<void> {
    const oldStatus: string = transaction.status;
    const oldSpecificStatus: string = transaction.specific_status;
    const newStatus: string = result?.payment?.status;
    const newSpecificStatus: string = result?.payment?.specificStatus;

    const updateData: any = { };

    if (newStatus && newStatus !== oldStatus) {
      updateData.status = newStatus;
    }

    if (newSpecificStatus && newSpecificStatus !== oldSpecificStatus) {
      updateData.specific_status = newSpecificStatus;
    }

    if (Object.keys(updateData).length > 0) {
      await this.transactionsService.updateByUuid(transaction.uuid, updateData);
    }
  }

  private async isActionOptionsListImplemented(
    transaction: TransactionUnpackedDetailsInterface,
  ): Promise<boolean> {
    const integrationName: string = transaction.type;
    const url: string = `${this.thirdPartyPaymentsMicroUrl}/api/integration/${integrationName}`;

    const config: AxiosRequestConfig = {
      headers: {
        'Accept': 'application/json, text/plain, */*',
      },
      method: 'GET',
      params: { },
      url: url,
    };
    const result: any = await this.executeThirdPartyRequest(config);

    if (result && result.actions ) {
      return result.actions.findIndex((action: InnerActionInterface) => {
        return action.name === ThirdPartyPaymentActionsEnum.actionOptionsList;
      }) > -1;
    } else {
      return false;
    }
  }

  private async runThirdPartyAction(
    transaction: TransactionUnpackedDetailsInterface,
    action: string,
    actionPayload?: ActionPayloadInterface,
  ): Promise<any> {
    const businessId: string = transaction.business_uuid;
    const integrationName: string = transaction.type;

    const url: string =
      `${this.thirdPartyPaymentsMicroUrl}`
        + `/api/business/${businessId}/integration/${integrationName}/action/${action}`;

    const config: AxiosRequestConfig = {
      data: actionPayload,
      headers: {
        'Accept': 'application/json, text/plain, */*',
      },
      method: 'POST',
      params: { },
      url: url,
    };

    return this.executeThirdPartyRequest(config);
  }


  private async executeThirdPartyRequest(axiosRequestConfig: AxiosRequestConfig): Promise<any> {

    this.logger.log({
      data: axiosRequestConfig.data,
      message: 'Starting third party payment call',
      url: axiosRequestConfig.url,
    });

    const response: Observable<AxiosResponse<any>> = await this.httpService.request(axiosRequestConfig);

    return response.pipe(
      map((res: any) => {
        this.logger.log({
          data: axiosRequestConfig.data,
          message: 'Received response from third party payment call',
          response: res.data,
          url: axiosRequestConfig.url,
        });

        return res.data;
      }),
      catchError((error: AxiosError) => {
        this.logger.error({
          data: axiosRequestConfig.data,
          error: error.response.data,
          message: 'Failed response from third party payment call',
          url: axiosRequestConfig.url,
        });

        throw new HttpException(error.response.data.message, error.response.data.code);
      }),
    )
      .toPromise();
  }

}
