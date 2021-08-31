Feature: Refunded transactions message sending
  Background:
    Given I remember as "businessId" following value:
    """
    "36bf8981-8827-4c0c-a645-02d9fc6d72c8"
    """
    Given I remember as "transactionId" following value:
    """
    "ad738281-f9f0-4db7-a4f6-670b0dff5327"
    """
  Scenario: Payment action "refund" completed
    Given I authenticate as a user with the following data:
    """
    {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I mock an axios request with parameters:
    """
    {
      "request": {
        "method": "post",
        "url": "*/api/business/{{businessId}}/integration/stripe/action/action-refund",
        "body": "{\"fields\":{\"amount\":25},\"paymentId\":\"{{transactionId}}\"}",
        "headers": {
          "Accept": "application/json, text/plain, */*",
          "Content-Type": "application/json;charset=utf-8",
          "authorization": "*"
        }
      },
      "response": {
        "status": 200,
        "body": {}
      }
    }
    """
    And I mock an axios request with parameters:
    """
    {
      "request": {
        "method": "post",
        "url": "*/api/business/{{businessId}}/integration/stripe/action/action-list",
        "body": "{\"paymentId\":\"{{transactionId}}\"}",
        "headers": {
          "Accept": "application/json, text/plain, */*",
          "Content-Type": "application/json;charset=utf-8",
          "authorization": "*"
        }
      },
      "response": {
        "status": 200,
        "body": {
          "refund": true
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
            "action_running": false,
            "santander_applications": [],
            "uuid": "{{transactionId}}"
          }
         ],
        "result": {}
      }
      """
    And I mock Elasticsearch method "search" with:
      """
      {
        "arguments": [
          "folder_transactions"
        ]
      }
      """
    And I mock Elasticsearch method "singleIndex" with:
      """
      {
        "arguments": [
          "folder_transactions"
         ]
      }
      """
    And I use DB fixture "transactions/partial-capture/third-party-payment"
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/refund" with json:
    """
    {
      "fields": {
        "amount": 25
      }
    }
    """
    When look for model "Transaction" by following JSON and remember as "transaction":
      """
      {
        "uuid": "{{transactionId}}"
      }
      """
    Then print RabbitMQ message list
    Then RabbitMQ exchange "async_events" should contain following ordered messages:
    """
    [
      {
        "createdAt": "*",
        "encryption": "none",
        "metadata": {
         "locale": "en"
        },
        "name": "transactions_app.payment.updated",
        "payload": "*",
        "uuid": "*",
        "version": 0
      },
      {
        "name": "transactions.event.payment.subtract",
        "payload": {
          "amount": 25,
          "business": {
            "id": "{{transaction.businessId}}"
          },
          "channel_set": {
            "id": "{{transaction.channel_set_uuid}}"
          },
          "date": "{{transaction.updated_at}}",
          "id": "{{transaction.uuid}}",
          "items": "{{transaction.items}}"
        }
      }
    ]
    """
