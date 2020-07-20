import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import * as WebSocket from 'ws';
import { MessageNameEnum } from './enums/message-name.enum';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer() private server: any;

  public constructor() { }

  @SubscribeMessage(MessageNameEnum.UPDATE_STATUS)
  public async onConnectEvent(client: WebSocket, payload: any): Promise<any> {

    return {
      name: MessageNameEnum.UPDATE_STATUS,
      result: true,
    };
  }
}
