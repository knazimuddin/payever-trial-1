Feature: Order invoice email
  Scenario: Received payment submitted message with successful status and supported channel type
    Given I remember as "messagePayload" following value:
      """
      {
        "payment": {
          "id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
          "channel": "shop",
          "customer_email": "some_customer@email.com",
          "status": "APPROVED",
          "business": {
            "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
          }
        }
      }
      """
    Given I use DB fixture "transactions/shipping-goods"
    When I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
      """
      {
        "name": "checkout.event.payment.submitted",
        "payload":{
          "payment": {
            "id": "{{messagePayload.payment.id}}",
            "channel": "{{messagePayload.payment.channel}}",
            "customer_email": "{{messagePayload.payment.customer_email}}",
            "status": "{{messagePayload.payment.status}}",
            "business": {
              "id": "{{messagePayload.payment.business.id}}"
            },
            "items": []
          }
        }
      }
      """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    And print RabbitMQ message list
    Then RabbitMQ exchange "async_events" should contain following ordered messages:
      """
      [
        {
          "name": "payever.event.payment.email",
          "payload": {
            "to": "{{messagePayload.payment.customer_email}}",
            "template_name": "order_invoice_template",
            "payment": {
              "id": "{{messagePayload.payment.id}}"
            }
          }
        }
      ]
      """

  Scenario: Received payment submitted message with successful status and not supported channel type
    Given I remember as "messagePayload" following value:
      """
      {
        "payment": {
          "id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
          "channel": "pos",
          "customer_email": "some_customer@email.com",
          "status": "APPROVED",
          "business": {
            "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
          }
        }
      }
      """
    Given I use DB fixture "transactions/shipping-goods"
    When I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
      """
      {
        "name": "checkout.event.payment.submitted",
        "payload":{
          "payment": {
            "id": "{{messagePayload.payment.id}}",
            "channel": "{{messagePayload.payment.channel}}",
            "status": "{{messagePayload.payment.status}}",
            "business": {
              "id": "{{messagePayload.payment.business.id}}"
            },
            "items": []
          }
        }
      }
      """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    And print RabbitMQ message list
    Then RabbitMQ exchange "async_events" should not contain following messages:
      """
      [
        {
          "name": "payever.event.payment.email"
        }
      ]
      """

  Scenario: Received payment submitted message with unsuccessful status and supported channel type
    Given I remember as "messagePayload" following value:
      """
      {
        "payment": {
          "id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
          "channel": "shop",
          "customer_email": "some_customer@email.com",
          "status": "STATUS_CANCELLED",
          "business": {
            "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
          }
        }
      }
      """
    Given I use DB fixture "transactions/shipping-goods"
    When I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
      """
      {
        "name": "checkout.event.payment.submitted",
        "payload":{
          "payment": {
            "id": "{{messagePayload.payment.id}}",
            "channel": "{{messagePayload.payment.channel}}",
            "status": "{{messagePayload.payment.status}}",
            "business": {
              "id": "{{messagePayload.payment.business.id}}"
            },
            "items": []
          }
        }
      }
      """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    And print RabbitMQ message list
    Then RabbitMQ exchange "async_events" should not contain following messages:
      """
      [
        {
          "name": "payever.event.payment.email"
        }
      ]
      """
