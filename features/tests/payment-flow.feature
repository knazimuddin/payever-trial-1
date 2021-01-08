Feature: Full real payment flow
  Scenario: Payment flow from creation to checkout and transaction
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"checkout.event.payment-flow.created",
      "uuid":"0f838187-9d56-4d4d-a76a-62a373fd003b",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-04-15T07:32:32+00:00",
      "metadata":{
        "locale":"en",
        "client_ip":"146.120.244.56"
      },
      "payload":{
        "flow":{
          "id":"a6a85f9d44fb95f83912521016fc34fe",
          "amount":0,
          "shipping_fee":0,
          "shipping_method_code":"",
          "shipping_method_name":"",
          "tax_value":0,
          "currency":"EUR",
          "channel_set_uuid":"42debf61-e648-48cd-a1bb-5f7155ad9670",
          "step":"payment_step.initialize",
          "state":"IN PROGRESS",
          "origin":"web",
          "express":false,
          "extra":[]
        }
      }
    }
    """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"checkout.event.payment-flow.updated",
      "uuid":"5a688ce2-efc0-4883-8560-7c1a786bff34",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-04-15T07:32:32+00:00",
      "metadata":{
        "locale":"en",
        "client_ip":"146.120.244.56"
      },
      "payload":{
        "flow":{
          "id":"a6a85f9d44fb95f83912521016fc34fe",
          "amount":0,
          "shipping_fee":0,
          "shipping_method_code":"",
          "shipping_method_name":"",
          "tax_value":0,
          "currency":"EUR",
          "channel_set_uuid":"42debf61-e648-48cd-a1bb-5f7155ad9670",
          "step":"payment_step.initialize",
          "state":"IN PROGRESS",
          "origin":"restapi.v2",
          "express":false,
          "x_frame_host":"https:\/\/checkout.test.devpayever.com",
          "extra":[]
        }
      }
    }
    """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"checkout.event.payment-flow.updated",
      "uuid":"d771f7c3-636a-4f10-b1b8-125091888c68",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-04-15T07:32:46+00:00",
      "metadata":{
        "locale":"en",
        "client_ip":"146.120.244.56"
      },
      "payload":{
        "flow":{
          "id":"a6a85f9d44fb95f83912521016fc34fe",
          "amount":650,
          "shipping_fee":0,
          "shipping_method_code":"",
          "shipping_method_name":"",
          "tax_value":0,
          "currency":"EUR",
          "reference":"diusfhiuwehfui",
          "channel_set_uuid":"42debf61-e648-48cd-a1bb-5f7155ad9670",
          "step":"payment_step.initialize",
          "state":"IN PROGRESS",
          "origin":"restapi.v2",
          "express":false,
          "x_frame_host":"https:\/\/checkout.test.devpayever.com",
          "extra":[]
        }
      }
    }
    """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"checkout.event.payment-flow.updated",
      "uuid":"5f1eb313-11f1-437f-a4f2-0294728e2ff7",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-04-15T07:33:03+00:00",
      "metadata":{
        "locale":"en",
        "client_ip":"146.120.244.56"
      },
      "payload":{
        "flow":{
          "id":"a6a85f9d44fb95f83912521016fc34fe",
          "amount":650,
          "shipping_fee":0,
          "shipping_method_code":"",
          "shipping_method_name":"",
          "tax_value":0,
          "currency":"EUR",
          "reference":"diusfhiuwehfui",
          "channel_set_uuid":"42debf61-e648-48cd-a1bb-5f7155ad9670",
          "step":"payment_step.initialize",
          "state":"IN PROGRESS",
          "origin":"restapi.v2",
          "express":false,
          "x_frame_host":"https:\/\/checkout.test.devpayever.com",
          "extra":[]
        }
      }
    }
    """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"checkout.event.payment-flow.updated",
      "uuid":"db5ce0aa-7830-4019-a7e6-a9cb63406389",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-04-15T07:33:03+00:00",
      "metadata":{
        "locale":"en",
        "client_ip":"146.120.244.56"
      },
      "payload":{
        "flow":{
          "id":"a6a85f9d44fb95f83912521016fc34fe",
          "amount":650,
          "shipping_fee":0,
          "shipping_method_code":"",
          "shipping_method_name":"",
          "tax_value":0,
          "currency":"EUR",
          "reference":"diusfhiuwehfui",
          "salutation":"SALUTATION_MR",
          "first_name":"asdasd",
          "last_name":"asdsad",
          "country":"DE",
          "city":"Hamburg",
          "zip_code":"20457",
          "street":"Am Strandkai",
          "channel_set_uuid":"42debf61-e648-48cd-a1bb-5f7155ad9670",
          "step":"payment_step.initialize",
          "state":"IN PROGRESS",
          "origin":"restapi.v2",
          "express":false,
          "x_frame_host":"https:\/\/checkout.test.devpayever.com",
          "extra":[]
        }
      }
    }
    """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"checkout.event.payment.created",
      "uuid":"2b63d76c-7a59-4716-a62b-867d436d10a2",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-04-15T07:33:15+00:00",
      "metadata":{
        "locale":"en",
        "client_ip":"146.120.244.56"
      },
      "payload":{
        "payment":{
          "id":"8ecc3fbbf663c2908503cedeaa61a79a",
          "api_call_id": "test_api_call_id_12345",
          "uuid":"f61e09b6-61ca-426b-8ee6-e8ce3118e932",
          "status":"STATUS_NEW",
          "business":{
            "uuid":"504dbe56-a67f-4e92-9470-477e88b12bae",
            "slug":"504dbe56-a67f-4e92-9470-477e88b12bae",
            "company_name":"testing widgets 1",
            "company_email":"testingplugins@gmail.com"
          },
          "address":{
            "uuid":"df036ec4-8ab1-4870-bdd2-7f732ec5752a",
            "salutation":"SALUTATION_MR",
            "first_name":"asdasd",
            "last_name":"asdsad",
            "email":"ewfowefioweuh@gmail.com",
            "country":"DE",
            "country_name":"Germany",
            "city":"Hamburg",
            "zip_code":"20457",
            "street":"Am Strandkai"
          },
          "currency":"EUR",
          "payment_type":"stripe_directdebit",
          "customer_name":"asdasd asdsad",
          "customer_email":"ewfowefioweuh@gmail.com",
          "channel":"link",
          "amount":650,
          "total":650,
          "total_base_currency":650,
          "items":[],
          "created_at":"2019-04-15T07:33:15+00:00",
          "updated_at":"2019-04-15T07:33:15+00:00",
          "payment_details":[],
          "business_option_id":34196,
          "reference":"diusfhiuwehfui",
          "color_state":"yellow",
          "history":[],
          "payment_flow":{
            "id":"a6a85f9d44fb95f83912521016fc34fe"
          },
          "channel_set":{
            "uuid":"42debf61-e648-48cd-a1bb-5f7155ad9670",
            "original_id":"42debf61-e648-48cd-a1bb-5f7155ad9670",
            "channel_type":"link",
            "business_uuid":"504dbe56-a67f-4e92-9470-477e88b12bae"
          },
          "user_uuid":"72b87c60-bd12-4413-ab44-6b182d9e7948",
          "delivery_fee":0,
          "payment_fee":19.1,
          "down_payment":0,
          "shipping_method_name":""
        }
      }
    }
    """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"checkout.event.payment-flow.updated",
      "uuid":"f5bee9fa-4392-4686-b17f-22f39cc42641",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-04-15T07:33:15+00:00",
      "metadata":{
        "locale":"en",
        "client_ip":"146.120.244.56"
      },
      "payload":{
        "flow":{
          "id":"a6a85f9d44fb95f83912521016fc34fe",
          "amount":650,
          "shipping_fee":0,
          "shipping_method_code":"",
          "shipping_method_name":"",
          "tax_value":0,
          "currency":"EUR",
          "reference":"diusfhiuwehfui",
          "salutation":"SALUTATION_MR",
          "first_name":"asdasd",
          "last_name":"asdsad",
          "country":"DE",
          "city":"Hamburg",
          "zip_code":"20457",
          "street":"Am Strandkai",
          "channel_set_uuid":"42debf61-e648-48cd-a1bb-5f7155ad9670",
          "step":"payment_step.initialize",
          "state":"IN PROGRESS",
          "origin":"restapi.v2",
          "express":false,
          "x_frame_host":"https:\/\/checkout.test.devpayever.com",
          "extra":[]
        }
      }
    }
    """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"payever.microservice.payment.history.add",
      "uuid":"c5765def-e93f-4e95-9c0d-bcd908137c4a",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-04-15T07:33:16+00:00",
      "metadata":{
        "locale":"en"
      },
      "payload":{
        "history_type":"capture",
        "payment":{
          "id":"8ecc3fbbf663c2908503cedeaa61a79a"
        },
        "data":[]
      }
    }
    """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"payever.microservice.payment.history.add",
      "uuid":"006ed8d8-83b5-42b5-9c4d-cfe05b923867",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-04-15T07:33:16+00:00",
      "metadata":{
        "locale":"en",
        "client_ip":"146.120.244.56"
      },
      "payload":{
        "history_type":"statuschanged",
        "payment":{
          "id":"8ecc3fbbf663c2908503cedeaa61a79a"
        },
        "data":{
          "payment_status":"STATUS_IN_PROCESS"
        }
      }
    }
    """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"checkout.event.payment.updated",
      "uuid":"a0899096-3f6e-4b5d-8b66-8ce59bb0b41f",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-04-15T07:33:16+00:00",
      "metadata":{
        "locale":"en",
        "client_ip":"146.120.244.56"
      },
      "payload":{
        "payment":{
          "id":"8ecc3fbbf663c2908503cedeaa61a79a",
          "uuid":"f61e09b6-61ca-426b-8ee6-e8ce3118e932",
          "status":"STATUS_IN_PROCESS",
          "business":{
            "uuid":"504dbe56-a67f-4e92-9470-477e88b12bae",
            "slug":"504dbe56-a67f-4e92-9470-477e88b12bae",
            "company_name":"testing widgets 1",
            "company_email":"testingplugins@gmail.com"
          },
          "address":{
            "uuid":"df036ec4-8ab1-4870-bdd2-7f732ec5752a",
            "salutation":"SALUTATION_MR",
            "first_name":"asdasd",
            "last_name":"asdsad",
            "email":"ewfowefioweuh@gmail.com",
            "country":"DE",
            "country_name":"Germany",
            "city":"Hamburg",
            "zip_code":"20457",
            "street":"Am Strandkai"
          },
          "currency":"EUR",
          "payment_type":"stripe_directdebit",
          "customer_name":"asdasd asdsad",
          "customer_email":"ewfowefioweuh@gmail.com",
          "channel":"link",
          "amount":650,
          "total":650,
          "total_base_currency":650,
          "items":[],
          "created_at":"2019-04-15T07:33:15+00:00",
          "updated_at":"2019-04-15T07:33:16+00:00",
          "payment_details":{
            "source_id":"src_1EPPJXK2gwAPC0qOmFfqz0hG",
            "iban":"DE89370400440532013000",
            "mandate_reference":"6SQGLGIWR4IVSCIT",
            "mandate_url":"https:\/\/hooks.stripe.com\/adapter\/sepa_debit\/file\/src_1EPPJXK2gwAPC0qOmFfqz0hG\/src_client_secret_EtBgQ0jvY9ZD7VuU1nkDajIS",
            "charge_id":"py_1EPPJYK2gwAPC0qO7SWh37ar"
          },
          "business_option_id":34196,
          "reference":"diusfhiuwehfui",
          "color_state":"yellow",
          "payment_flow":{
            "id":"a6a85f9d44fb95f83912521016fc34fe"
          },
          "place":"charged",
          "channel_set":{
            "uuid":"42debf61-e648-48cd-a1bb-5f7155ad9670",
            "original_id":"42debf61-e648-48cd-a1bb-5f7155ad9670",
            "channel_type":"link",
            "business_uuid":"504dbe56-a67f-4e92-9470-477e88b12bae"
          },
          "user_uuid":"72b87c60-bd12-4413-ab44-6b182d9e7948",
          "delivery_fee":0,
          "payment_fee":19.1,
          "down_payment":0,
          "shipping_method_name":""
        }
      }
    }
    """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"checkout.event.payment-flow.updated",
      "uuid":"1395ef3d-8b61-44cc-98d4-e15794bc958c",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-04-15T07:33:16+00:00",
      "metadata":{
        "locale":"en",
        "client_ip":"146.120.244.56"
      },
      "payload":{
        "flow":{
          "id":"a6a85f9d44fb95f83912521016fc34fe",
          "amount":650,
          "shipping_fee":0,
          "shipping_method_code":"",
          "shipping_method_name":"",
          "tax_value":0,
          "currency":"EUR",
          "reference":"diusfhiuwehfui",
          "salutation":"SALUTATION_MR",
          "first_name":"asdasd",
          "last_name":"asdsad",
          "country":"DE",
          "city":"Hamburg",
          "zip_code":"20457",
          "street":"Am Strandkai",
          "channel_set_uuid":"42debf61-e648-48cd-a1bb-5f7155ad9670",
          "step":"payment_step.initialize",
          "state":"FINISHED",
          "origin":"restapi.v2",
          "express":false,
          "x_frame_host":"https:\/\/checkout.test.devpayever.com",
          "extra":[

          ]
        }
      }
    }
    """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"payever.microservice.payment.history.add",
      "uuid":"fbae3c7d-8531-4080-908b-fa84e918cb89",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-04-15T07:33:20+00:00",
      "metadata":{
        "locale":"en",
        "client_ip":"54.187.205.235"
      },
      "payload":{
        "history_type":"statuschanged",
        "payment":{
          "id":"8ecc3fbbf663c2908503cedeaa61a79a"
        },
        "data":{
          "payment_status":"STATUS_ACCEPTED"
        }
      }
    }
    """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"checkout.event.payment.updated",
      "uuid":"ef854bb3-867c-4f8f-97cd-e99624d7a3c3",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-04-15T07:33:20+00:00",
      "metadata":{
        "locale":"en",
        "client_ip":"54.187.205.235"
      },
      "payload":{
        "payment":{
          "id":"8ecc3fbbf663c2908503cedeaa61a79a",
          "uuid":"f61e09b6-61ca-426b-8ee6-e8ce3118e932",
          "status":"STATUS_ACCEPTED",
          "business":{
            "uuid":"504dbe56-a67f-4e92-9470-477e88b12bae",
            "slug":"504dbe56-a67f-4e92-9470-477e88b12bae",
            "company_name":"testing widgets 1",
            "company_email":"testingplugins@gmail.com"
          },
          "address":{
            "uuid":"df036ec4-8ab1-4870-bdd2-7f732ec5752a",
            "salutation":"SALUTATION_MR",
            "first_name":"asdasd",
            "last_name":"asdsad",
            "email":"ewfowefioweuh@gmail.com",
            "country":"DE",
            "country_name":"Germany",
            "city":"Hamburg",
            "zip_code":"20457",
            "street":"Am Strandkai"
          },
          "currency":"EUR",
          "payment_type":"stripe_directdebit",
          "customer_name":"asdasd asdsad",
          "customer_email":"ewfowefioweuh@gmail.com",
          "channel":"link",
          "amount":650,
          "total":650,
          "total_base_currency":650,
          "items":[],
          "created_at":"2019-04-15T07:33:15+00:00",
          "updated_at":"2019-04-15T07:33:20+00:00",
          "payment_details":{
            "source_id":"src_1EPPJXK2gwAPC0qOmFfqz0hG",
            "iban":"DE89370400440532013000",
            "mandate_reference":"6SQGLGIWR4IVSCIT",
            "mandate_url":"https:\/\/hooks.stripe.com\/adapter\/sepa_debit\/file\/src_1EPPJXK2gwAPC0qOmFfqz0hG\/src_client_secret_EtBgQ0jvY9ZD7VuU1nkDajIS",
            "charge_id":"py_1EPPJYK2gwAPC0qO7SWh37ar"
          },
          "business_option_id":34196,
          "reference":"diusfhiuwehfui",
          "color_state":"green",
          "payment_flow":{
            "id":"a6a85f9d44fb95f83912521016fc34fe"
          },
          "place":"completed",
          "channel_set":{
            "uuid":"42debf61-e648-48cd-a1bb-5f7155ad9670",
            "original_id":"42debf61-e648-48cd-a1bb-5f7155ad9670",
            "channel_type":"link",
            "business_uuid":"504dbe56-a67f-4e92-9470-477e88b12bae"
          },
          "user_uuid":"72b87c60-bd12-4413-ab44-6b182d9e7948",
          "delivery_fee":0,
          "payment_fee":19.1,
          "down_payment":0,
          "shipping_method_name":""
        }
      }
    }
    """
    And I mock Elasticsearch method "singleIndex" with:
      """
      {
        "arguments": [
          "transactions",
          {
            "uuid": "f61e09b6-61ca-426b-8ee6-e8ce3118e932"
          }
         ],
        "result": {}
      }
      """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    Then print RabbitMQ message list
    Then debug RabbitMQ message list
    And RabbitMQ exchange "async_events" should contain following ordered messages:
    """
    [
      {
        "name": "notifications.event.notification.notify",
        "payload": {
          "kind": "business",
          "entity": "504dbe56-a67f-4e92-9470-477e88b12bae",
          "app": "transactions",
          "message": "notification.transactions.title.new_transaction",
          "data": {
            "transactionId": "f61e09b6-61ca-426b-8ee6-e8ce3118e932"
          }
        }
      },
      {
        "name": "transactions.event.payment.add",
        "payload": {
          "id": "f61e09b6-61ca-426b-8ee6-e8ce3118e932",
          "amount": 650,
          "items": [],
          "channel_set": {
            "id": "42debf61-e648-48cd-a1bb-5f7155ad9670"
          },
          "business": {
            "id": "504dbe56-a67f-4e92-9470-477e88b12bae"
          }
        }
      }
    ]
    """
    And print Elasticsearch calls
    And Elasticsearch calls stack should contain following ordered messages:
    """
    [
      [
        "singleIndex",
        [
          "transactions",
          {
            "uuid": "f61e09b6-61ca-426b-8ee6-e8ce3118e932"
          }
        ]
      ],
      [
        "singleIndex",
        [
          "transactions",
          {
            "uuid": "f61e09b6-61ca-426b-8ee6-e8ce3118e932"
          }
        ]
      ],
      [
        "singleIndex",
        [
          "transactions",
          {
            "uuid": "f61e09b6-61ca-426b-8ee6-e8ce3118e932"
          }
        ]
      ],
      [
        "singleIndex",
        [
          "transactions",
          {
            "uuid": "f61e09b6-61ca-426b-8ee6-e8ce3118e932"
          }
        ]
      ],
      [
        "singleIndex",
        [
          "transactions",
          {
            "uuid": "f61e09b6-61ca-426b-8ee6-e8ce3118e932"
          }
        ]
      ],
      [
        "singleIndex",
        [
          "transactions",
          {
            "uuid": "f61e09b6-61ca-426b-8ee6-e8ce3118e932"
          }
        ]
      ]
    ]
    """
    Then I look for model "Transaction" by following JSON and remember as "createdTransaction":
    """
    {
      "original_id": "8ecc3fbbf663c2908503cedeaa61a79a"
    }
    """
    Then model "Transaction" with id "{{createdTransaction._id}}" should contain json:
    """
    {
      "api_call_id": "test_api_call_id_12345"
    }
    """

  Scenario: Payment migrate event
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"checkout.event.payment.migrate",
      "uuid":"2b63d76c-7a59-4716-a62b-867d436d10a2",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-04-15T07:33:15+00:00",
      "metadata":{
        "locale":"en",
        "client_ip":"146.120.244.56"
      },
      "payload":{
        "payment":{
          "id":"8ecc3fbbf663c2908503cedeaa61a79a",
          "uuid":"f61e09b6-61ca-426b-8ee6-e8ce3118e932",
          "api_call_id": "test_api_call_id_12345",
          "status":"STATUS_ACCEPTED",
          "business":{
            "uuid":"504dbe56-a67f-4e92-9470-477e88b12bae",
            "slug":"504dbe56-a67f-4e92-9470-477e88b12bae",
            "company_name":"testing widgets 1",
            "company_email":"testingplugins@gmail.com"
          },
          "address":{
            "uuid":"df036ec4-8ab1-4870-bdd2-7f732ec5752a",
            "salutation":"SALUTATION_MR",
            "first_name":"asdasd",
            "last_name":"asdsad",
            "email":"ewfowefioweuh@gmail.com",
            "country":"DE",
            "country_name":"Germany",
            "city":"Hamburg",
            "zip_code":"20457",
            "street":"Am Strandkai"
          },
          "currency":"EUR",
          "payment_type":"stripe_directdebit",
          "customer_name":"asdasd asdsad",
          "customer_email":"ewfowefioweuh@gmail.com",
          "channel":"link",
          "amount":650,
          "total":650,
          "total_base_currency":650,
          "items":[],
          "created_at":"2019-04-15T07:33:15+00:00",
          "updated_at":"2019-04-15T07:33:15+00:00",
          "payment_details":[],
          "business_option_id":34196,
          "reference":"diusfhiuwehfui",
          "color_state":"yellow",
          "history":[],
          "payment_flow":{
            "id":"a6a85f9d44fb95f83912521016fc34fe"
          },
          "channel_set":{
            "uuid":"42debf61-e648-48cd-a1bb-5f7155ad9670",
            "original_id":"42debf61-e648-48cd-a1bb-5f7155ad9670",
            "channel_type":"link",
            "business_uuid":"504dbe56-a67f-4e92-9470-477e88b12bae"
          },
          "user_uuid":"72b87c60-bd12-4413-ab44-6b182d9e7948",
          "delivery_fee":0,
          "payment_fee":19.1,
          "down_payment":0,
          "shipping_method_name":"",
          "history": [
            {
              "action":"statuschanged",
              "payment_status":"STATUS_ACCEPTED"
            }
          ]
        }
      }
    }
    """
    And I mock Elasticsearch method "singleIndex" with:
      """
      {
        "arguments": [
          "transactions",
          {
            "uuid": "f61e09b6-61ca-426b-8ee6-e8ce3118e932"
          }
         ],
        "result": {}
      }
      """
    When I process messages from RabbitMQ "async_events_transactions_micro" channel
    And look for model "Transaction" by following JSON and remember as "transaction":
      """
      {
        "uuid": "f61e09b6-61ca-426b-8ee6-e8ce3118e932"
      }
      """
    Then model "Transaction" with id "{{transaction._id}}" should contain json:
      """
      {
        "status":"STATUS_ACCEPTED",
        "reference":"diusfhiuwehfui",
        "currency":"EUR",
        "type":"stripe_directdebit",
        "channel":"link",
        "amount":650,
        "api_call_id": "test_api_call_id_12345"
      }
      """
