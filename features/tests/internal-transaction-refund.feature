@internal-transaction
Feature: Internal refunded transactions message sending
  Scenario: Payment event updated refund
    Given I use DB fixture "transactions/partial-capture/third-party-payment-refunded-amount"
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

    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name": "transactions.event.payment.refund.internal",
      "payload": {
        "id": "ad738281-f9f0-4db7-a4f6-670b0dff5327",
        "business": {
          "id": "36bf8981-8827-4c0c-a645-02d9fc6d72c8"
        },
        "channel_set": {
          "id": "7c2298a7-a172-4048-8977-dbff24dec100"
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
          "id": "ad738281-f9f0-4db7-a4f6-670b0dff5327",
          "business": {
            "id": "36bf8981-8827-4c0c-a645-02d9fc6d72c8"
          },
          "channel_set": {
            "id": "7c2298a7-a172-4048-8977-dbff24dec100"
          },
          "amount": 100,
          "date": "2019-04-15T07:33:15.000Z",
          "last_updated": "2019-04-15T07:33:15.000Z"
        }
      }
    ]
    """
