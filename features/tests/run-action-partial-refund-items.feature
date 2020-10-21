Feature: Partial capture

  Background:
    Given I remember as "businessId" following value:
    """
    "36bf8981-8827-4c0c-a645-02d9fc6d72c8"
    """
    Given I remember as "transactionId" following value:
    """
    "ad738281-f9f0-4db7-a4f6-670b0dff5327"
    """

  Scenario: Do refund action with missing identifier in item
    Given I authenticate as a user with the following data:
    """
    {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I use DB fixture "transactions/partial-capture/third-party-payment"
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/refund" with json:
    """
    {
      "fields": {
        "payment_items": [
          {
            "name": "Test item",
            "price": 500,
            "quantity": 1
          }
        ]
      }
    }
    """
    Then print last response
    And the response status code should be 400
    And the response should contain json:
    """
    {
       "statusCode": 400,
       "error": "Bad Request",
       "message": "Identifier is missing for payment item Test item"
    }
    """

  Scenario: Do refund action with item that does not belong to transaction
    Given I authenticate as a user with the following data:
    """
    {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I use DB fixture "transactions/partial-capture/third-party-payment"
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/refund" with json:
    """
    {
      "fields": {
        "payment_items": [
          {
            "identifier": "id-12345",
            "name": "Test item",
            "price": 500,
            "quantity": 1
          }
        ]
      }
    }
    """
    Then print last response
    And the response status code should be 400
    And the response should contain json:
    """
    {
       "statusCode": 400,
       "error": "Bad Request",
       "message": "Item with identifier id-12345 does not belong to transaction"
    }
    """

  Scenario: Do refund action with item quantity greater than initial in transaction
    Given I authenticate as a user with the following data:
    """
    {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I use DB fixture "transactions/partial-capture/third-party-payment"
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/refund" with json:
    """
    {
      "fields": {
        "payment_items": [
          {
            "identifier": "c4bce8c1-6572-43fc-8fc9-0f8f0a5efad1",
            "name": "test item",
            "price": 50,
            "quantity": 3
          }
        ]
      }
    }
    """
    Then print last response
    And the response status code should be 400
    And the response should contain json:
    """
    {
       "statusCode": 400,
       "error": "Bad Request",
       "message": "Item with identifier c4bce8c1-6572-43fc-8fc9-0f8f0a5efad1 cannot have greater quantity than transaction item quantity"
    }
    """

  Scenario: Do refund action with already refunded item
    Given I authenticate as a user with the following data:
    """
    {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I use DB fixture "transactions/partial-capture/third-party-payment-refunded"
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/refund" with json:
    """
    {
      "fields": {
        "payment_items": [
          {
            "identifier": "c4bce8c1-6572-43fc-8fc9-0f8f0a5efad1",
            "name": "test item",
            "price": 50,
            "quantity": 1
          }
        ]
      }
    }
    """
    Then print last response
    And the response status code should be 400
    And the response should contain json:
    """
    {
       "statusCode": 400,
       "error": "Bad Request",
       "message": "Quantity for item c4bce8c1-6572-43fc-8fc9-0f8f0a5efad1 is greater than allowed"
    }
    """

  Scenario: Do refund action with item
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
        "body": "{\"fields\":{\"payment_items\":[{\"identifier\":\"3a6bd3ae-3b30-41a4-803f-e457d6113279\",\"name\":\"test item\",\"price\":25,\"quantity\":1}]},\"paymentId\":\"{{transactionId}}\"}",
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
    And I use DB fixture "transactions/partial-capture/third-party-payment"
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/refund" with json:
    """
    {
      "fields": {
        "payment_items": [
          {
            "identifier": "3a6bd3ae-3b30-41a4-803f-e457d6113279",
            "name": "test item",
            "price": 25,
            "quantity": 1
          }
        ]
      }
    }
    """
    Then print last response
    And the response status code should be 200
    And the response should contain json:
    """
    {
       "transaction": {
         "id": "*",
         "original_id": "*",
         "uuid": "{{transactionId}}",
         "amount": 100,
         "amount_capture_rest": 100,
         "amount_captured": 0,
         "amount_refund_rest": 100,
         "amount_refunded": 0,
         "currency": "EUR",
         "total": 100
       }
    }
    """
    And I look for model "Transaction" by following JSON and remember as "transactionModel":
    """
    {
      "uuid": "{{transactionId}}"
    }
    """
    Then print storage key "transactionModel"
    Then stored value "transactionModel" should contain json:
    """
    {
      "captured_items": [],
      "refunded_items": [
        {
          "identifier": "3a6bd3ae-3b30-41a4-803f-e457d6113279",
          "name": "test item",
          "price": 25,
          "quantity": 1,
          "options": []
        }
      ]
    }
    """
