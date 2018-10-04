import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MigrationService } from '../services';
import { TransactionsService } from '../services';
import * as Serialize from 'php-serialize';

class GeneralSerializer {
  fix() {
    const fixObjectKeys = function(obj) {
      Object.keys(obj).forEach((key) => {
        const fixedKey = key.replace(/\0\*\0/g, '');
        obj[fixedKey] = obj[key];
        delete obj[key];
        if (obj[fixedKey] instanceof GeneralSerializer) {
          fixObjectKeys(obj[fixedKey]);
        }
      });
    };
    fixObjectKeys(this);
  }
}

@Controller('migration')
export class MigrationController {

  constructor(
    private readonly migrationService: MigrationService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get('fetch')
  @HttpCode(HttpStatus.OK)
  async fetch(
  ) {
    let mysqlData = await this.migrationService.find();
    // mysqlData = mysqlData.map((d) => d.payments_flow);
    console.log(mysqlData);
    return 'fetched';
  }

  @Get('insert')
  @HttpCode(HttpStatus.OK)
  async insert(
  ) {
    // const mysqlData = await this.migrationService.find();
    // console.log(mysqlData);
    return 'inserted';
  }

  @Get('migrate')
  @HttpCode(HttpStatus.OK)
  async migrate(
  ) {
    const mysqlData = await this.migrationService.find();

    // const transaction = mysqlData.find((transaction) => {
      // return transaction.payment_details;
    // });

    // transaction.payment_details = Serialize.unserialize(transaction.payment_details, {
      // 'Payever\\PaymentMethods\\SantanderDEFactoringBundle\\Model\\PaymentDetails': GeneralSerializer,
      // 'Payever\\PaymentMethods\\SantanderInstallmentCompatibilityBundle\\Details\\Entities\\Debtor': GeneralSerializer,
      // 'Payever\\PaymentMethods\\SantanderInstallmentCompatibilityBundle\\Details\\InstallmentPaymentDetails': GeneralSerializer,
    // });
    // transaction.payment_details.fix();

    // console.log(JSON.stringify(transaction.payment_details));

    mysqlData.forEach(async (transaction) => {
      if (transaction.payment_details) {
        try {
          transaction.payment_details = Serialize.unserialize(transaction.payment_details, {
            'Payever\\PaymentMethods\\SantanderDEFactoringBundle\\Model\\PaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\SantanderInstallmentCompatibilityBundle\\Details\\Entities\\Debtor': GeneralSerializer,
            'Payever\\PaymentMethods\\SantanderInstallmentCompatibilityBundle\\Details\\InstallmentPaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\SofortBundle\\Entity\\SofortPaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\PaymillBundle\\Entity\\PaymillCreditCardPaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\PaypalBundle\\Entity\\PaypalPaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\SantanderDKInstallmentBundle\\Entity\\SantanderDKInstallmentPaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\PayEx\\PayExFakturaBundle\\Entity\\PayExFakturaPaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\StripeBundle\\Entity\\StripePaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\PaymillBundle\\Entity\\PaymillDirectDebitPaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\SofortCompatibilityBundle\\Model\\SofortPaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\SantanderDKInstallmentCompatibilityBundle\\Details\\SantanderDKPaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\PayEx\\PayExCreditCardBundle\\Entity\\PayExCreditCardPaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\SantanderNorwayCompatibilityBundle\\Model\\Details': GeneralSerializer,
            'Payever\\PaymentMethods\\SantanderInstallmentCompatibilityBundle\\Details\\PosInstallmentPaymentDetails': GeneralSerializer,
            'DateTime': GeneralSerializer,
            'Payever\\PaymentMethods\\SantanderDEInvoiceBundle\\Details\\SantanderDEInvoicePaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\StripeCompatibilityBundle\\Details\\StripePaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\SantanderSwedenCompatibilityBundle\\Model\\SantanderSEPaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\SantanderSwedenCompatibilityBundle\\Model\\SantanderSEPaymentDetail': GeneralSerializer,
            'Payever\\PaymentMethods\\CashBundle\\Entity\\CashPaymentDetail': GeneralSerializer,
            'Payever\\PaymentMethods\\CashBundle\\Entity\\CashPaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\SantanderSwedenInstallmentBundle\\Entity\\SantanderSEInstallmentPaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\SantanderNorwayInstallmentBundle\\Entity\\SantanderNOInstallmentPaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\SantanderInstallmentCompatibilityBundle\\Details\\Entities\\CreditCalculation': GeneralSerializer,
            'Payever\\PaymentMethods\\InvoiceBundle\\Entity\\RiskCheck': GeneralSerializer,
            'Payever\\PaymentMethods\\InvoiceBundle\\Entity\\Invoice': GeneralSerializer,
            'Payever\\PaymentMethods\\SantanderInstallmentBundle\\Santander\\Model\\CreditCalculationResultModel': GeneralSerializer,
            'Payever\\PaymentMethods\\SantanderInstallmentCompatibilityBundle\\Details\\CCPInstallmentPaymentDetails': GeneralSerializer,
            'Payever\\PaymentMethods\\SantanderInstallmentBundle\\Entity\\InstallmentPaymentDetails': GeneralSerializer,
          });
          transaction.payment_details.fix();
          transaction.payment_details = JSON.stringify(transaction.payment_details);
        } catch(e) {
          console.log('unserialization error - payment details not saved for transaction: ', transaction.uuid);
        }
      }
      await this.transactionsService.createOrUpdate(transaction);
    });

    return 'inserted';
  }

}
