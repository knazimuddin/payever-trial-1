import { AuthorizeDataInterface } from './authorize-data.interface';
import { CancelDataInterface } from './cancel-data.interface';
import { CaptureDataInterface } from './capture-data.interface';
import { ChangeAmountDataInterface } from './change-amount-data.interface';
import { ReminderDataInterface } from './reminder-data.interface';
import { ReturnDataInterface } from './return-data.interface';
import { ShippingGoodsDataInterface } from './shipping-goods-data.interface';
import { UpdateDataInterface } from './update-data.interface';
import { UploadDataInterface } from './upload-data.interface';
import { VoidDataInterface } from './void-data.interface';

export interface FieldsInterface {
  payment_capture?: CaptureDataInterface;
  capture_funds?: CaptureDataInterface;
  payment_return?: ReturnDataInterface;
  payment_cancel?: CancelDataInterface;
  payment_upload?: UploadDataInterface;
  payment_shipping_goods?: ShippingGoodsDataInterface;
  payment_authorize?: AuthorizeDataInterface;
  payment_update?: UpdateDataInterface;
  payment_void?: VoidDataInterface;
  payment_change_amount?: ChangeAmountDataInterface;
  payment_reminder?: ReminderDataInterface;
}
