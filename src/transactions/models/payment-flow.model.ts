import { Document } from 'mongoose';
import { PaymentFlowInterface } from '../interfaces';

export interface PaymentFlowModel extends PaymentFlowInterface, Document {
  id: string;
}
