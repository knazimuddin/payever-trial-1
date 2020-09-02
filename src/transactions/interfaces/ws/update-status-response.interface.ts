import { MessageResponseInterface } from './message-response.interface';

export interface UpdateStatusResponseInterface extends MessageResponseInterface {
  id: string;
  status?: string;
  specificStatus?: string;
}
