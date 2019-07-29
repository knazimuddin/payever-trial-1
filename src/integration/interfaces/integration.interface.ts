import { FeaturesInterface } from './features.interface';

export interface IntegrationInterface {
  readonly name: string;
  readonly category: string;
  readonly features: FeaturesInterface;
}
