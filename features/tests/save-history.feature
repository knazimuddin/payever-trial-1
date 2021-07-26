Feature: Save history records
  Scenario: Payment action completed
    Given I use DB fixture "transactions/transaction-for-history"
    And I mock Elasticsearch method "singleIndex" with:
      """
      {
        "arguments": [
          "transactions",
          {
            "uuid": "ad738281-f9f0-4db7-a4f6-670b0dff5327"
          }
         ],
        "result": {}
      }
      """
    When I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
      """
      {
        "name": "payever.event.payment.action.completed",
        "payload": {
          "payment": {
            "id": "b140034c74959b9f45c383e33f937e56",
            "uuid": "ad738281-f9f0-4db7-a4f6-670b0dff5327",
            "amount": 5290,
            "total": 5290,
            "currency": "NOK",
            "reference": "1906191249319025",
            "customer_name": "Test Customer",
            "customer_email": "test@test.com",
            "specific_status": "PAID",
            "status": "STATUS_CANCELLED",
            "address": {
              "country": "NO",
              "city": "HAUGLANDSHELLA",
              "zip_code": "5310",
              "street": "Ravnetua 21",
              "phone": "90782130",
              "salutation": "SALUTATION_MR",
              "first_name": "Christian",
              "last_name": "Breivik"
            },
            "fee": 0,
            "delivery_fee": 0,
            "payment_fee": 0,
            "down_payment": 0,
            "place": "cancelled",
            "business_payment_option": {
              "payment_option": {
                "payment_method": "santander_invoice_no"
              }
            },
            "created_at": "2019-06-19T10:50:00+00:00"
          },
          "action": "statuschanged",
          "data": {
            "payment_status": "STATUS_CANCELLED"
          }
        }
      }
      """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    When look for model "Transaction" by following JSON and remember as "transaction":
      """
      {
        "uuid": "ad738281-f9f0-4db7-a4f6-670b0dff5327"
      }
      """
    Then model "Transaction" with id "{{transaction._id}}" should contain json:
      """
      {
        "history": [
          {
            "action" : "statuschanged",
            "payment_status" : "STATUS_CANCELLED",
            "refund_items" : [],
            "upload_items" : []
          }
        ]
      }
      """

  Scenario: Payment Email Sent
    Given I use DB fixture "transactions/transaction-for-history"
    And I mock Elasticsearch method "singleIndex" with:
      """
      {
        "arguments": [
          "transactions",
          {
            "uuid": "ad738281-f9f0-4db7-a4f6-670b0dff5327"
          }
         ],
        "result": {}
      }
      """
    When I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
      """
      {
        "name": "mailer.event.payment-mail.sent",
        "payload": {
            "id": "242905da-16b0-4fd2-98c9-259b5aceb62f",
            "templateName": "some_template",
            "transactionId": "ad738281-f9f0-4db7-a4f6-670b0dff5327"
        }
      }
      """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    When look for model "Transaction" by following JSON and remember as "transaction":
      """
      {
        "uuid": "ad738281-f9f0-4db7-a4f6-670b0dff5327"
      }
      """
    Then model "Transaction" with id "{{transaction._id}}" should contain json:
      """
      {
        "history": [
          {
            "action" : "email_sent",
            "mail_event": {
              "event_id": "242905da-16b0-4fd2-98c9-259b5aceb62f",
              "template_name": "some_template"
            }
          }
        ]
      }
      """

  Scenario: Shipping label downloaded
    Given I use DB fixture "transactions/transaction-for-history"
    And I mock Elasticsearch method "singleIndex" with:
      """
      {
        "arguments": [
          "transactions",
          {
            "uuid": "ad738281-f9f0-4db7-a4f6-670b0dff5327"
          }
         ],
        "result": {}
      }
      """
    When I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
      """
      {
        "name": "shipping.event.shipping-label.downloaded",
        "payload": {
          "shippingOrder": {
            "id": "3263d46c-755d-4fe6-b02e-ede4d63748b4"
          }
        }
      }
      """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    When look for model "Transaction" by following JSON and remember as "transaction":
      """
      {
        "uuid": "ad738281-f9f0-4db7-a4f6-670b0dff5327"
      }
      """
    Then model "Transaction" with id "{{transaction._id}}" should contain json:
      """
      {
        "history": [
          {
            "action" : "shipping-label-downloaded"
          }
        ]
      }
      """

  Scenario: Shipping slip downloaded
    Given I use DB fixture "transactions/transaction-for-history"
    And I mock Elasticsearch method "singleIndex" with:
      """
      {
        "arguments": [
          "transactions",
          {
            "uuid": "ad738281-f9f0-4db7-a4f6-670b0dff5327"
          }
         ],
        "result": {}
      }
      """
    When I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
      """
      {
        "name": "shipping.event.shipping-slip.downloaded",
        "payload": {
          "shippingOrder": {
            "id": "3263d46c-755d-4fe6-b02e-ede4d63748b4"
          }
        }
      }
      """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    When look for model "Transaction" by following JSON and remember as "transaction":
      """
      {
        "uuid": "ad738281-f9f0-4db7-a4f6-670b0dff5327"
      }
      """
    Then model "Transaction" with id "{{transaction._id}}" should contain json:
      """
      {
        "history": [
          {
            "action" : "shipping-slip-downloaded"
          }
        ]
      }
      """
