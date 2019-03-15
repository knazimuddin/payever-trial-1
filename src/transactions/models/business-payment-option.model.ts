import { Document } from 'mongoose';
import { BusinessPaymentOptionInterface } from '../interfaces';

export interface BusinessPaymentOptionModel extends BusinessPaymentOptionInterface, Document {
  id: number;
}
