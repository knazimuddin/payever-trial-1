import { Injectable } from '@nestjs/common';
import { PactRabbitMqMessageProvider, AbstractMessageMock } from '@pe/pact-kit';
import { PaymentMailEventProducer } from '../../../src/transactions/producer'
import { ShippingMailDto } from '../../../src/transactions/dto/mail';
import { TransactionChangedDto } from '../../../src/transactions/dto/checkout-rabbit';
import * as uuid from 'uuid';

@Injectable()
export class PaymentMailMessagesProvider extends AbstractMessageMock {
  @PactRabbitMqMessageProvider('payever.event.payment.email')
  public async mockProduceShippingEvent(): Promise<void> {
    const producer: PaymentMailEventProducer = await this.getProvider<PaymentMailEventProducer>(PaymentMailEventProducer);
    await producer.produceShippingEvent(
      {
        to: 'test@test.com',
        cc: ['cc1@test.com', 'cc2@test.com'],
        template_name: 'tempalte name',
        business: {
            uuid : uuid.v4(),
        },
        payment: {
            id: uuid.v4(),
            uuid: uuid.v4(),
            amount: 123,
            total: 123,
            currency: 'EUR',
            reference: 'reference',
            delivery_fee: 123,
            customer_name: 'customer name',
            customer_email: 'customer@mail.com',
            created_at: '2019-12-10T14:33:27.876Z',
            address: {
                city: 'city',
                company: 'company',
                country: 'de', 
                country_name: 'indonesia',
                email: 'some@mail.com',
                fax: 'some fax number',
                first_name: 'first name',
                last_name: 'last name',
                mobile_phone: '+49-152-5555-428',
                phone: '+49-159-5555-970',
                salutation: 'salutation',
                social_security_number: 'social security number',
                type: 'shipping',
                street: 'street addres',
                zip_code: 'zip code'
            },
            vat_rate: 123,
            payment_option: {
                payment_method: 'payment method'
            },
        },
        payment_items: [
            {
                uuid: uuid.v4(),
                name: 'name item',
                price: 123,
                quantity: 123,
                vat_rate: 123,
                thumbnail: 'thumbnail',
                options: [],
            }
        ],
        variables: {
            trackingNumber: '01283102981',
            trackingUrl: 'http://sometracking.com',
            deliveryDate: '2019-12-10T14:33:27.876Z',
        }
      } as ShippingMailDto,
    );
  }

  @PactRabbitMqMessageProvider('payever.event.payment.email')
  public async mockProduceOrderInvoiceEvent(): Promise<void> {
    const producer: PaymentMailEventProducer = await this.getProvider<PaymentMailEventProducer>(PaymentMailEventProducer);
    await producer.produceOrderInvoiceEvent(
      {
        payment:{
            id: uuid.v4(),
            uuid: uuid.v4(),
            channel_set: {
                uuid: uuid.v4(),
            },
            payment_flow: {
                id: uuid.v4(),
                amount: 123,
                shipping_fee: 123,
                tax_value: 123,
                step: 'step'
            },
            action_running: true,
            amount: 123,
            business_option_id: 123,
            business_uuid: '834a1b9e-c044-4c23-adb6-d386e88f13b2',
            channel: 'channel',
            channel_uuid: '8358cf0c-fdf6-46d0-ac37-28e4741555b2',
            channel_set_uuid: '14e738f6-30cc-4d63-892a-2912bc288f9b',
            created_at: 'created_at',
            currency: 'currency',
            customer_email: 'customer_email',
            customer_name: 'customer_name',
            delivery_fee: 123,
            down_payment: 123,
            fee_accepted: true,
            merchant_email: 'merchant_email',
            merchant_name: 'merchant_name',
            payment_fee: 123,
            payment_flow_id: 'payment_flow_id',
            place: 'place',
            reference: 'reference',
            shipping_address: {
                city: 'city',
                company: 'company',
                country: 'country',
                country_name: 'country_name',
                email: 'email',
                fax: 'fax',
                first_name: 'first_name',
                last_name: 'last_name',
                mobile_phone: 'mobile_phone',
                phone: 'phone',
                salutation: 'salutation',
                social_security_number: 'social_security_number',
                type: 'shipping',
                street: 'street',
                zip_code: 'zip_code',
            },
            shipping_category: 'shipping_category',
            shipping_method_name: 'shipping_method_name',
            shipping_option_name: 'shipping_option_name',
            specific_status: 'specific_status',
            status: 'status',
            status_color: 'status_color',
            store_id: 'store_id',
            store_name: 'store_name',
            total: 123,
            type: 'type',
            updated_at: 'updated_at',
            user_uuid: '3d2ff034-a318-4e7c-8928-be239d0be96c',
            payment_type: 'payment_type',
            payment_details: {},
        }
      } as TransactionChangedDto,
    );
  }
}
