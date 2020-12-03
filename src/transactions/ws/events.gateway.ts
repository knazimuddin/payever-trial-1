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
  ) { }

  @SubscribeMessage(MessageNameEnum.CONNECT)
  public async onConnectEvent(client: WebSocket, payload: ConnectPayloadInterface): Promise<ConnectResponseInterface> {
    return {
      name: MessageNameEnum.CONNECT,
      result: this.verifyToken(payload.token),
    };
  }

  @SubscribeMessage(MessageNameEnum.UPDATE_STATUS)
  public async onUpdateStatusEvent(
    client: WebSocket,
    payload: UpdateStatusPayloadInterface,
  ): Promise<UpdateStatusResponseInterface> {
    const transactionId: string = payload.id;

    const updateStatusResponse: UpdateStatusResponseInterface = {
      id: transactionId,
      name: MessageNameEnum.UPDATE_STATUS,
      result: false,
    };

    if (!this.verifyToken(payload.token)) {
      return updateStatusResponse;
    }

    try {
      const transactionModel: TransactionModel = await this.transactionService.findModelByUuid(transactionId);

      if (!transactionModel) {
        return updateStatusResponse;
      }

      const updatedTransaction: TransactionUnpackedDetailsInterface
        = await this.transactionActionService.updateStatus(transactionModel);

      updateStatusResponse.status = updatedTransaction.status;
      updateStatusResponse.specificStatus = updatedTransaction.specific_status;
      updateStatusResponse.result = true;
    } catch (error) {
      console.log(error.message);
      return updateStatusResponse;
    }

    return updateStatusResponse;
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
