import { Document } from 'mongoose';
import { AddressInterface } from '../interfaces';

export interface AddressModel extends AddressInterface, Document { }
