import { UnpackedDetailsInterface } from '../transaction';

export interface UnpackedDetailsAwareInterface {
  payment_details: UnpackedDetailsInterface;
}
