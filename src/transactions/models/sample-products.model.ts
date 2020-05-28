import { Document } from 'mongoose';
import { SampleProductInterface } from '../interfaces';

export interface SampleProductsModel extends SampleProductInterface, Document { }
