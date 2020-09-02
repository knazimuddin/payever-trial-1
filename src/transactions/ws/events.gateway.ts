import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import * as WebSocket from 'ws';
import { MessageNameEnum } from './enums/message-name.enum';
import { environment } from '../../environments';
import { verify as jwtVerify } from 'jsonwebtoken';
import {
  ConnectPayloadInterface,
  ConnectResponseInterface,
  UpdateStatusPayloadInterface,
  UpdateStatusResponseInterface,
} from '../interfaces/ws';
import { TransactionActionService, TransactionsService } from '../services';
import { TransactionModel } from '../models';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer() private server: any;

  public constructor(
    private readonly transactionService: TransactionsService,
    private readonly transactionActionService: TransactionActionService,
    private readonly logger: Logger,
  ) { }

  @SubscribeMessage(MessageNameEnum.CONNECT)
  public async onConnectEvent(client: WebSocket, payload: ConnectPayloadInterface): Promise<ConnectResponseInterface> {
    this.logger.log({
      message: 'Received connect websocket message',
    });

    return {
      name: MessageNameEnum.CONNECT,
      result: this.verifyToken(payload.token),
    };
  }

  @SubscribeMessage(MessageNameEnum.UPDATE_STATUS)
  public async onUpdateStatusEvent(
    client: WebSocket,
    payload: UpdateStatusPayloadInterface,
  ): Promise<any> {
    this.logger.log({
      message: 'Received update status websocket message',
      payload,
    });

    const event: string = MessageNameEnum.UPDATE_STATUS;
    const transactionId: string = payload.id;

    const updateStatusResponse: UpdateStatusResponseInterface = {
      id: transactionId,
      name: MessageNameEnum.UPDATE_STATUS,
      result: false,
    };

    const commonResponse: any = {
      data: updateStatusResponse,
      event,
    };

    if (!this.verifyToken(payload.token)) {
      return commonResponse;
    }

    try {
      const transactionModel: TransactionModel = await this.transactionService.findModelByUuid(transactionId);

      if (!transactionModel) {
        return commonResponse;
      }

      const updatedTransaction: TransactionUnpackedDetailsInterface
        = await this.transactionActionService.updateStatus(transactionModel);

      updateStatusResponse.status = updatedTransaction.status;
      updateStatusResponse.specificStatus = updatedTransaction.specific_status;
      updateStatusResponse.result = true;

      commonResponse.data = updateStatusResponse;
    } catch (error) {
      return commonResponse;
    }

    return commonResponse;
  }

  private verifyToken(token: string): boolean {
    try {
      jwtVerify(token, environment.jwtOptions.secret);
    } catch (e) {
      return false;
    }

    return true;
  }
}
