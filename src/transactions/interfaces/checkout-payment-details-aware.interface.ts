export interface CheckoutPaymentDetailsAwareInterface {
  payment_details: {
    finance_id: string,
    application_no: string,
    application_number: string,
  };
}
