import { MessageResponseInterface } from './message-response.interface';

export interface UpdateStatusResponseInterface extends MessageResponseInterface {
  uuid: string;
  status?: string;
  specificStatus?: string;
}
