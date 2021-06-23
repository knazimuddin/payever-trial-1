import { MessagePayloadInterface } from './message-payload.interface';

export interface UpdateStatusPayloadInterface extends MessagePayloadInterface {
  id: string;
  testMode?: boolean;
}
