Feature: Shipment confirmation email dto sending
  Scenario: Shipping order processed message received
    Given I remember as "messagePayload" following value:
    """
    {
      "transactionId": "ad738281-f9f0-4db7-a4f6-670b0dff5327",
      "trackingNumber": "123",
      "trackingUrl": "http://tracking.url"
    }
    """
    Given I use DB fixture "transactions/shipping-goods"
    When I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name": "shipping.event.shipping-order.processed",
      "payload": {
        "transactionId": "{{messagePayload.transactionId}}",
        "trackingNumber": "{{messagePayload.trackingNumber}}",
        "trackingUrl": "{{messagePayload.trackingUrl}}"
      }
    }
    """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    When look for model "Transaction" by JSON and remember it as "transaction"
      """
      {
        "uuid": "ad738281-f9f0-4db7-a4f6-670b0dff5327"
      }
      """
    Then RabbitMQ exchange "async_events" should contain json:
    """
    [
      {
        "name": "payever.event.payment.email",
        "payload": {
          "payment": {
            "id": "{{transaction.original_id}}"
          },
          "template_name": "shipping_order_template",
          "variables": {
            "trackingNumber": "{{messagePayload.trackingNumber}}",
            "trackingUrl": "{{messagePayload.trackingUrl}}"
          }
        }
      }
    ]
    """
