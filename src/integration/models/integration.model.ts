import { Document } from 'mongoose';
import { IntegrationInterface } from '../interfaces';
import { FeaturesModel } from './features.model';

export interface IntegrationModel extends IntegrationInterface, Document {
  readonly features: FeaturesModel;
}
