import { BaseFixture } from '@pe/cucumber-sdk';
import { BusinessPaymentOptionModel } from '../../../src/transactions/models';
import { BusinessPaymentOptionService } from '../../../src/transactions/services';

class ExampleFixture extends BaseFixture {
  public async apply(): Promise<void> {
    const service: BusinessPaymentOptionService = this.application.get(BusinessPaymentOptionService);

    await service.createOrUpdate({
      id : 50,
      uuid : '308dbdb1-cccc-bbbb-aaaa-305a3a774e3f',
      payment_option_id : 12,
      accept_fee : true,
      status : 'contract',
      fixed_fee : 0,
      variable_fee : 0,
      options : '[]',
      completed : true,
      shop_redirect_enabled : false,
      credentials : {},
    } as BusinessPaymentOptionModel);

    const bpo: BusinessPaymentOptionModel = await service.findOneById(50);
  }
}

export = ExampleFixture;
