import { BaseFixture } from '@pe/cucumber-sdk';
import { TransactionModel } from '../../../src/transactions/models';
import { transactionFactory } from '../factories';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { TransactionSchemaName } from '../../../src/transactions/schemas';

const transactionId: string = 'ad738281-f9f0-4db7-a4f6-670b0dff5327';
const businessId: string = '36bf8981-8827-4c0c-a645-02d9fc6d72c8';
const shippingOrderId: string = '3263d46c-755d-4fe6-b02e-ede4d63748b4';

class ShippingServiceMethodSelectedFixture extends BaseFixture {

  private readonly transactionModel: Model<TransactionModel> = this.application.get(getModelToken(TransactionSchemaName));

  public async apply(): Promise<void> {

    await this.transactionModel.create(transactionFactory({
      uuid: transactionId,
      business_uuid : businessId,
      shipping_order_id: shippingOrderId,
      merchant_name: 'Test merchant'
    }));
  }
}

export = ShippingServiceMethodSelectedFixture;
