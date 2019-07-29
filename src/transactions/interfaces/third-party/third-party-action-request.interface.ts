import { ActionPayloadInterface } from '../action-payload';

export interface ThirdPartyActionRequestInterface extends ActionPayloadInterface {
  reference: string;
  action: string;
  business: {
    id: string,
  };
  integration: {
    name: string,
  };
}
