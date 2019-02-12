import { Injectable } from "@nestjs/common";

@Injectable()
export class TransactionMapper {
  public mapExternalToLocalTransaction(data: any): any {
    const transaction = { ...data };
    transaction.type = data.type || data.payment_type;

    if (data.business) {
      transaction.business_uuid = data.business.uuid;
      transaction.merchant_name = data.business.company_name;
      transaction.merchant_email = data.business.company_email;
    }

    if (data.payment_flow) {
      transaction.payment_flow_id = data.payment_flow.id;
    }

    if (data.channel_set) {
      transaction.channel_set_uuid = data.channel_set.uuid;
    }

    if (typeof (data.payment_details) !== 'string' && data.payment_details) {
      transaction.payment_details = JSON.stringify(data.payment_details);

      transaction.santander_application = [];
      if (data.payment_details.application_no) {
        transaction.santander_application.push(data.payment_details.application_no);
      }

      if (data.payment_details.finance_id) {
        transaction.santander_application.push(data.payment_details.application_no);
      }

      if (data.payment_details.application_no) {
        transaction.santander_application.push(data.payment_details.application_no);
      }

      if (data.payment_details.application_number) {
        transaction.santander_application.push(data.payment_details.application_no);
      }
    }

    transaction.shipping_address = data.address;

    return transaction;
  }
}