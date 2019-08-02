import { Document } from 'mongoose';
import { BusinessCurrencyInterface } from '../interfaces';

export interface BusinessCurrencyModel extends BusinessCurrencyInterface, Document {

}
