import { BaseFixture } from '@pe/cucumber-sdk';
import { BusinessPaymentOptionModel, PaymentFlowModel, TransactionModel } from '../../../src/transactions/models';
import { businessPaymentOptionFactory, paymentFlowFactory, transactionFactory } from '../factories';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import {
  BusinessPaymentOptionSchemaName,
  PaymentFlowSchemaName,
  TransactionSchemaName
} from '../../../src/transactions/schemas';

const transactionId: string = 'ad738281-f9f0-4db7-a4f6-670b0dff5327';
const businessId: string = '36bf8981-8827-4c0c-a645-02d9fc6d72c8';
const businessOptionId: string = 1;
const paymentFlowId: string = 2;

class RunActionsAsyncThirdPartyFixture extends BaseFixture {

  private readonly transactionModel: Model<TransactionModel> = this.application.get(getModelToken(TransactionSchemaName));
  private readonly businessPaymentOptionModel: Model<BusinessPaymentOptionModel> = this.application.get(
    getModelToken(BusinessPaymentOptionSchemaName)
  );
  private readonly paymentFlowModel: Model<PaymentFlowModel> = this.application.get(
    getModelToken(PaymentFlowSchemaName)
  );

  public async apply(): Promise<void> {

    await this.transactionModel.create(transactionFactory.create({
      uuid: transactionId,
      business_uuid : businessId,
      merchant_name: 'Test merchant',
      business_option_id: businessOptionId,
      payment_flow_id: paymentFlowId,
      channel_set_uuid: '7c2298a7-a172-4048-8977-dbff24dec100',
      reference: 'f3d44333-21e2-4f0f-952b-72ac2dfb8fc9',
      type: 'santander_invoice_de',
    }));

    await this.businessPaymentOptionModel.create(businessPaymentOptionFactory.create({
      id: businessOptionId,
    }));

    await this.paymentFlowModel.create(paymentFlowFactory.create({
      id: paymentFlowId,
      uuid: 'bf86003c-27b1-46fd-a40f-ca20437e310a',
      channel_set_uuid: '7c2298a7-a172-4048-8977-dbff24dec100',
    }));
  }
}

export = RunActionsAsyncThirdPartyFixture;
