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
        to: 'to address',
        cc: ['cc address', 'cc address2'],
        template_name: 'tempalte name',
        business: {
            uuid : uuid.v4(),
        },
        payment: {
            id: uuid.v4(),
            uuid: uuid.v4(),
            amount: 123,
            total: 123,
            currency: 'some currency',
            reference: 'reference',
            delivery_fee: 123,
            customer_name: 'customer name',
            customer_email: 'customer@mail.com',
            created_at: '2019-12-10T14:33:27.876Z',
            address: {
                city: 'city',
                company: 'company',
                country: 'id', // code like de/en
                country_name: 'indonesia',
                email: 'some@mail.com',
                fax: 'some fax number',
                first_name: 'first name',
                last_name: 'last name',
                mobile_phone: 'mobile phone number',
                phone: 'phone number',
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
            trackingNumber: 'tracking number',
            trackingUrl: 'tracking url',
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
            business_uuid: 'business_uuid',
            channel: 'channel',
            channel_uuid: 'channel_uuid',
            channel_set_uuid: 'channel_set_uuid',
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
            user_uuid: 'user_uuid',
            payment_type: 'payment_type',
            payment_details: {},
        }
      } as TransactionChangedDto,
    );
  }
}
