import { Document } from 'mongoose';
import { BusinessInterface } from '../interfaces';

export interface BusinessModel extends BusinessInterface, Document {
}
