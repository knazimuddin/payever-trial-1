@internal-transaction
Feature: Internal refunded transactions message sending
  Scenario: Payment event updated refund
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
          "uuid":"f61e09b6-61ca-426b-8ee6-e8ce3118e932",
          "status":"STATUS_REFUNDED",
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
          "amount":100,
          "total":100,
          "total_base_currency":100,
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
        "history_type":"refund",
        "payment":{
          "id":"8ecc3fbbf663c2908503cedeaa61a79a"
        },
        "data":{
          "payment_status":"STATUS_REFUNDED",
          "amount": 100
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

    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name": "transactions.event.payment.refund.internal",
      "payload": {
        "id": "f61e09b6-61ca-426b-8ee6-e8ce3118e932",
        "business": {
          "id": "1ad81b43-174f-4549-b776-228cf4be9bd1"
        },
        "channel_set": {
          "id": "9e9dd289-758c-44a2-9a24-8443b049aeef"
        },
        "amount": 100,
        "date": "2019-04-15T07:33:15.000Z",
        "last_updated": "2019-04-15T07:33:15.000Z"
      }
    }
    """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    And print RabbitMQ message list
    Then the RabbitMQ exchange "async_events" should contain following messages:
    """
    [
      {
        "name": "transactions.event.payment.refund",
        "payload": {
          "id": "f61e09b6-61ca-426b-8ee6-e8ce3118e932",
          "business": {
            "id": "1ad81b43-174f-4549-b776-228cf4be9bd1"
          },
          "channel_set": {
            "id": "9e9dd289-758c-44a2-9a24-8443b049aeef"
          },
          "amount": 100,
          "date": "2019-04-15T07:33:15.000Z",
          "last_updated": "2019-04-15T07:33:15.000Z"
        }
      }
    ]
    """

  Scenario: Payment event updated refund 2
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

          "id" : "60153c80342a880011738a38",
          "action_running" : false,
          "santander_applications" : [
              "76102049191870"
          ],
          "delivery_fee" : 0,
          "payment_fee" : 0,
          "uuid" : "55d9f618-3ac4-48f4-a1c6-e0ec95c801b7",
          "amount" : 37.79,
          "api_call_id" : "600f6129-c40e-496d-8696-a21adc89d08e",
          "channel" : "api",
          "created_at" : "2021-01-30T11:01:20.000Z",
          "currency" : "EUR",
          "customer_email" : "sandro_just@hotmail.de",
          "customer_name" : "Sandro Just",
          "down_payment" : 0,
          "reference" : "28851",
          "shipping_address" : null,
          "specific_status" : "REFUNDED",
          "status" : "STATUS_REFUNDED",
          "total" : 37.79,
          "updated_at" : "2021-02-10T13:47:32.000Z",
          "items" : [
            {
              "_id" : "96af7946-d5af-5c05-a029-410c5c90f9c8",
              "uuid" : null,
              "identifier" : "C208ns210120ab",
              "name" : "Sony PS3 DualShock 3 Wireless Controller schwarz",
              "options" : null,
              "price" : 37.79,
              "price_net" : 0,
              "quantity" : 1,
              "thumbnail" : "",
              "vat_rate" : 0
            }
          ],
          "billing_address" : {
            "city" : "Rüdersdorf",
            "country" : "DE",
            "country_name" : "DE",
            "email" : "sandro_just@hotmail.de",
            "first_name" : "Sandro",
            "last_name" : "Just",
            "phone" : "033638135180",
            "salutation" : "SALUTATION_MR",
            "street" : "Brückenstraßen 33",
            "zip_code" : "15562",
            "_id" : "14d7c371-b8cb-4f1e-8a6d-de2a2cf67638"
          },
          "type" : "santander_invoice_de",
          "business_uuid" : "945fb7d9-43b7-4995-bd4d-c5267b219ae5",
          "merchant_name" : "ZOXS GmbH",
          "payment_flow_id" : "c1563ea059b79a3a36c731565b9b39b8",
          "original_id" : "55d9f618-3ac4-48f4-a1c6-e0ec95c801b7",
          "history" : [],
          "captured_items" : [],
          "refunded_items" : [],
          "merchant_email" : null

        }
      }
    }
    """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"payever.microservice.payment.history.add",
      "uuid":"55d9f618-3ac4-48f4-a1c6-e0ec95c801b7",
      "version":0,
      "encryption":"none",
      "createdAt":"2021-01-31T11:01:20.000Z",
      "metadata":{
        "locale":"en",
        "client_ip":"146.120.244.56"
      },
      "payload":{
        "history_type":"shipping_goods",
        "payment":{
          "id":"60153c80342a880011738a38"
        },
        "data":{
          "payment_status":"STATUS_PAID",
          "amount": 37.79
        }
      }
    }
    """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"payever.microservice.payment.history.add",
      "uuid":"55d9f618-3ac4-48f4-a1c6-e0ec95c801b7",
      "version":0,
      "encryption":"none",
      "createdAt":"2021-01-31T12:01:20.000Z",
      "metadata":{
        "locale":"en",
        "client_ip":"146.120.244.56"
      },
      "payload":{
        "history_type":"refund",
        "payment":{
          "id":"60153c80342a880011738a38"
        },
        "data":{
          "payment_status":"STATUS_REFUNDED",
          "amount": 37.79
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
            "uuid": "55d9f618-3ac4-48f4-a1c6-e0ec95c801b7"
          }
         ],
        "result": {}
      }
      """

    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name": "transactions.event.payment.refund.internal",
      "payload": {
        "amount": null,
        "business": {
          "id": "1ad81b43-174f-4549-b776-228cf4be9bd1"
        },
        "channel_set": {},
        "date": "2021-02-10T13:47:32.000Z",
        "id": "55d9f618-3ac4-48f4-a1c6-e0ec95c801b7",
        "items": [
          {
            "_id": "96af7946-d5af-5c05-a029-410c5c90f9c8",
            "uuid": null,
            "identifier": "C208ns210120ab",
            "name": "Sony PS3 DualShock 3 Wireless Controller schwarz",
            "options": null,
            "price": 37.79,
            "price_net": 0,
            "quantity": 1,
            "thumbnail": "",
            "vat_rate": 0
          }
        ],
        "last_updated": "2021-01-30T11:01:31.000Z"
      }
    }
    """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    And print RabbitMQ message list
    Then the RabbitMQ exchange "async_events" should contain following messages:
    """
    [
      {
        "name": "transactions.event.payment.refund",
        "payload": {
          "id": "55d9f618-3ac4-48f4-a1c6-e0ec95c801b7",
          "business": {
            "id": "1ad81b43-174f-4549-b776-228cf4be9bd1"
          },
          "channel_set": {},
          "date": "*",
          "last_updated": "*"
        }
      }
    ]
    """
