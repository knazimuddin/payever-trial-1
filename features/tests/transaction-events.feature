Feature: Transaction rabbit events
  Background:
    Given I remember as "paymentUuid" following value:
      """
      "08b1d4a82ca1c65aa35ad4c85f2ac8a8"
      """
    Given I remember as "originalId" following value:
      """
      "7e3dcb4bf94bf23f6d4113e5845fe9f8"
      """
    Given I remember as "flowId" following value:
      """
      "815e412c-6881-11e7-9835-52540073a0b6"
      """
  Scenario: Payment create
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name": "checkout.event.payment.created",
      "payload": {
        "payment": {
          "id": "{{originalId}}",
          "uuid": "{{paymentUuid}}",
          "amount": 1000,
          "delivery_fee": 0,
          "down_payment": 0,
          "total": 1000,
          "business": {
            "uuid": "business-uuid",
            "company_name": "Business name"
          },
          "channel": "pos",
          "channel_set": {
            "uuid": "channel-set-uuid"
          },
          "currency": "EUR",
          "customer_name": "Test test",
          "customer_emails": "test@test.com",
          "payment_flow": {
            "id": "{{flowId}}",
            "payment_method": "santander_installment"
          },
          "payment_type": "santander_installment",
          "reference": "1234567890",
          "status": "STATUS_NEW",
          "address": {
            "city": "Berlin",
            "country": "DE",
            "country_name": "Germany",
            "street": "street 1",
            "zip_code": "1234"
          },
          "items": [],
          "created_at": "2019-12-14T14:16:09.000",
          "updated_at": "2019-12-14T14:16:09.000",
          "test_mode": false
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
            "uuid": "{{paymentUuid}}",
            "test_mode": false
          }
         ],
        "result": {}
      }
      """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    And look for model "Transaction" by following JSON and remember as "transaction":
      """
      {
        "uuid": "{{paymentUuid}}"
      }
      """
    And model "Transaction" with id "{{transaction._id}}" should contain json:
      """
      {
          "uuid": "{{paymentUuid}}",
          "original_id": "{{originalId}}",
          "type": "santander_installment",
          "reference": "1234567890",
          "status": "STATUS_NEW",
          "test_mode": false
      }
      """
    And model "TestTransaction" found by following JSON should not exist:
      """
      {
        "uuid": "{{paymentUuid}}"
      }
      """

  Scenario: Payment create from test_mode
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name": "checkout.event.payment.created.test_mode",
      "payload": {
        "payment": {
          "id": "{{originalId}}",
          "uuid": "{{paymentUuid}}",
          "amount": 1000,
          "delivery_fee": 0,
          "down_payment": 0,
          "total": 1000,
          "business": {
            "uuid": "business-uuid",
            "company_name": "Business name"
          },
          "channel": "pos",
          "channel_set": {
            "uuid": "channel-set-uuid"
          },
          "currency": "EUR",
          "customer_name": "Test test",
          "customer_emails": "test@test.com",
          "payment_flow": {
            "id": "{{flowId}}",
            "payment_method": "santander_installment"
          },
          "payment_type": "santander_installment",
          "reference": "1234567890",
          "status": "STATUS_NEW",
          "address": {
            "city": "Berlin",
            "country": "DE",
            "country_name": "Germany",
            "street": "street 1",
            "zip_code": "1234"
          },
          "items": [],
          "created_at": "2019-12-14T14:16:09.000",
          "updated_at": "2019-12-14T14:16:09.000",
          "test_mode": true
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
            "uuid": "{{paymentUuid}}",
            "test_mode": true
          }
         ],
        "result": {}
      }
      """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    And look for model "TestTransaction" by following JSON and remember as "transaction":
      """
      {
        "uuid": "{{paymentUuid}}"
      }
      """
    And model "TestTransaction" with id "{{transaction._id}}" should contain json:
      """
      {
          "uuid": "{{paymentUuid}}",
          "original_id": "{{originalId}}",
          "type": "santander_installment",
          "reference": "1234567890",
          "status": "STATUS_NEW",
          "test_mode": true
      }
      """
    And model "Transaction" found by following JSON should not exist:
      """
      {
        "uuid": "{{paymentUuid}}"
      }
      """

  Scenario: Payment update
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name": "checkout.event.payment.updated",
      "payload": {
        "payment": {
          "id": "{{originalId}}",
          "uuid": "{{paymentUuid}}",
          "amount": 1000,
          "delivery_fee": 0,
          "down_payment": 0,
          "total": 1000,
          "business": {
            "uuid": "business-uuid",
            "company_name": "Business name"
          },
          "channel": "pos",
          "channel_set": {
            "uuid": "channel-set-uuid"
          },
          "currency": "EUR",
          "customer_name": "Test test",
          "customer_emails": "test@test.com",
          "payment_flow": {
            "id": "{{flowId}}",
            "payment_method": "santander_installment"
          },
          "payment_type": "santander_installment",
          "reference": "1234567890",
          "status": "STATUS_ACCEPTED",
          "address": {
            "city": "Berlin",
            "country": "DE",
            "country_name": "Germany",
            "street": "street 1",
            "zip_code": "1234"
          },
          "items": [],
          "created_at": "2019-12-14T14:16:09.000",
          "updated_at": "2019-12-14T14:16:09.000",
          "test_mode": false
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
            "uuid": "{{paymentUuid}}",
            "test_mode": false
          }
         ],
        "result": {}
      }
      """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    And look for model "Transaction" by following JSON and remember as "transaction":
      """
      {
        "uuid": "{{paymentUuid}}"
      }
      """
    And model "Transaction" with id "{{transaction._id}}" should contain json:
      """
      {
          "uuid": "{{paymentUuid}}",
          "original_id": "{{originalId}}",
          "type": "santander_installment",
          "reference": "1234567890",
          "status": "STATUS_ACCEPTED",
          "test_mode": false
      }
      """
    And model "TestTransaction" found by following JSON should not exist:
      """
      {
        "uuid": "{{paymentUuid}}"
      }
      """

  Scenario: Payment update from test_mode
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name": "checkout.event.payment.updated.test_mode",
      "payload": {
        "payment": {
          "id": "{{originalId}}",
          "uuid": "{{paymentUuid}}",
          "amount": 1000,
          "delivery_fee": 0,
          "down_payment": 0,
          "total": 1000,
          "business": {
            "uuid": "business-uuid",
            "company_name": "Business name"
          },
          "channel": "pos",
          "channel_set": {
            "uuid": "channel-set-uuid"
          },
          "currency": "EUR",
          "customer_name": "Test test",
          "customer_emails": "test@test.com",
          "payment_flow": {
            "id": "{{flowId}}",
            "payment_method": "santander_installment"
          },
          "payment_type": "santander_installment",
          "reference": "1234567890",
          "status": "STATUS_ACCEPTED",
          "address": {
            "city": "Berlin",
            "country": "DE",
            "country_name": "Germany",
            "street": "street 1",
            "zip_code": "1234"
          },
          "items": [],
          "created_at": "2019-12-14T14:16:09.000",
          "updated_at": "2019-12-14T14:16:09.000",
          "test_mode": true
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
            "uuid": "{{paymentUuid}}",
            "test_mode": true
          }
         ],
        "result": {}
      }
      """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    And look for model "TestTransaction" by following JSON and remember as "transaction":
      """
      {
        "uuid": "{{paymentUuid}}"
      }
      """
    And model "TestTransaction" with id "{{transaction._id}}" should contain json:
      """
      {
          "uuid": "{{paymentUuid}}",
          "original_id": "{{originalId}}",
          "type": "santander_installment",
          "reference": "1234567890",
          "status": "STATUS_ACCEPTED",
          "test_mode": true
      }
      """
    And model "Transaction" found by following JSON should not exist:
      """
      {
        "uuid": "{{paymentUuid}}"
      }
      """

  Scenario: Payment remove
    Given I use DB fixture "transactions/transaction-details-paid"
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name": "checkout.event.payment.removed",
      "payload": {
        "payment": {
          "id": "{{originalId}}",
          "uuid": "{{paymentUuid}}",
          "test_mode": false
        }
      }
    }
    """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    And model "Transaction" found by following JSON should not exist:
      """
      {
        "uuid": "{{paymentUuid}}"
      }
      """

  Scenario: Payment remove from test_mode
    Given I use DB fixture "transactions/test-transaction-details-paid"
    Then I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name": "checkout.event.payment.removed.test_mode",
      "payload": {
        "payment": {
          "id": "{{originalId}}",
          "uuid": "{{paymentUuid}}",
          "test_mode": true
        }
      }
    }
    """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    And model "TestTransaction" found by following JSON should not exist:
      """
      {
        "uuid": "{{paymentUuid}}"
      }
      """
