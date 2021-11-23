import { FeaturesInterface } from './features.interface';
import { InnerActionInterface } from './inner-action.interface';

export interface IntegrationInterface {
  readonly name: string;
  readonly category: string;
  readonly features: FeaturesInterface;
  readonly actions: InnerActionInterface[];
}
