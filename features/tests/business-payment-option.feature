Feature: Full real payment flow
  Scenario: Creating BPO with event from checkout
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"checkout.event.business-payment-option.created",
      "uuid":"7ee31df2-e6eb-4467-8e8d-522988f426b8",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-08-28T12:32:26+00:00",
      "metadata":{
        "locale":"de",
        "client_ip":"176.198.69.86"
      },
      "payload":{
        "business_payment_option":{
          "id":300088,
          "uuid":"6fef651d-de9a-441c-a88f-2b9ce0f41aba",
          "business_uuid":"42bf8f24-d383-4e5a-ba18-e17d2e03bb0e",
          "payment_option_id":69,
          "payment_option_uuid":"78759cf4-ebf9-4b4f-82d7-5be6346c9a32",
          "accept_fee":true,
          "status":"new",
          "fixed_fee":0,
          "variable_fee":0,
          "credentials":[

          ],
          "completed":false,
          "shop_redirect_enabled":false
        }
      }
    }
    """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    And look for model "BusinessPaymentOption" by JSON and remember it as "bpo"
      """
      {
        "uuid": "6fef651d-de9a-441c-a88f-2b9ce0f41aba"
      }
      """
    And model "BusinessPaymentOption" with id "{{bpo._id}}" should contain json:
      """
      {
           "id" : 300088,
          "__v" : 0,
          "accept_fee" : true,
          "completed" : false,
          "credentials" : {},
          "fixed_fee" : 0,
          "payment_option_id" : 69,
          "shop_redirect_enabled" : false,
          "status" : "new",
          "uuid" : "6fef651d-de9a-441c-a88f-2b9ce0f41aba",
          "variable_fee" : 0
      }
      """

  Scenario: Create and update event came at the same time
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"checkout.event.business-payment-option.created",
      "uuid":"7ee31df2-e6eb-4467-8e8d-522988f426b8",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-08-28T12:32:26+00:00",
      "metadata":{
        "locale":"de",
        "client_ip":"176.198.69.86"
      },
      "payload":{
        "business_payment_option":{
          "id":300088,
          "uuid":"6fef651d-de9a-441c-a88f-2b9ce0f41aba",
          "business_uuid":"42bf8f24-d383-4e5a-ba18-e17d2e03bb0e",
          "payment_option_id":69,
          "payment_option_uuid":"78759cf4-ebf9-4b4f-82d7-5be6346c9a32",
          "accept_fee":true,
          "status":"new",
          "fixed_fee":0,
          "variable_fee":0,
          "credentials":[

          ],
          "completed":false,
          "shop_redirect_enabled":false
        }
      }
    }
    """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name":"checkout.event.business-payment-option.updated",
      "uuid":"3facc7ac-6eab-44af-87cc-9a6b90b48d57",
      "version":0,
      "encryption":"none",
      "createdAt":"2019-08-28T12:33:20+00:00",
      "metadata":{
        "locale":"de",
        "client_ip":"176.198.69.86"
      },
      "payload":{
        "business_payment_option":{
          "id":300088,
          "uuid":"6fef651d-de9a-441c-a88f-2b9ce0f41aba",
          "business_uuid":"42bf8f24-d383-4e5a-ba18-e17d2e03bb0e",
          "payment_option_id":69,
          "payment_option_uuid":"78759cf4-ebf9-4b4f-82d7-5be6346c9a32",
          "accept_fee":true,
          "status":"new",
          "fixed_fee":0,
          "variable_fee":0,
          "credentials":[],
          "completed":true,
          "shop_redirect_enabled":false
        }
      }
    }
    """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    And look for model "BusinessPaymentOption" by JSON and remember it as "bpo"
      """
      {
        "uuid": "6fef651d-de9a-441c-a88f-2b9ce0f41aba"
      }
      """
    And model "BusinessPaymentOption" with id "{{bpo._id}}" should contain json:
      """
      {
           "id" : 300088,
          "__v" : 0,
          "accept_fee" : true,
          "completed" : true,
          "credentials" : {},
          "fixed_fee" : 0,
          "payment_option_id" : 69,
          "shop_redirect_enabled" : false,
          "status" : "new",
          "uuid" : "6fef651d-de9a-441c-a88f-2b9ce0f41aba",
          "variable_fee" : 0
      }
      """

