Feature: Partial capture - amount flow

  Background:
    Given I remember as "businessId" following value:
    """
    "36bf8981-8827-4c0c-a645-02d9fc6d72c8"
    """
    Given I remember as "transactionId" following value:
    """
    "ad738281-f9f0-4db7-a4f6-670b0dff5327"
    """

  Scenario: Do shipping goods action with negative amount
    Given I authenticate as a user with the following data:
    """
    {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I use DB fixture "transactions/partial-capture/third-party-payment"
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/shipping_goods" with json:
    """
    {
      "fields": {
        "amount": -100
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
       "message": "Amount should be positive value"
    }
    """

  Scenario: Do shipping goods action with amount greater than transaction amount
    Given I authenticate as a user with the following data:
    """
    {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I use DB fixture "transactions/partial-capture/third-party-payment"
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/shipping_goods" with json:
    """
    {
      "fields": {
        "amount": 5000
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
       "message": "Amount is higher than allowed capture amount"
    }
    """

  Scenario: Do shipping goods action with amount greater than allowed amount (already captured partly)
    Given I authenticate as a user with the following data:
    """
    {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I use DB fixture "transactions/partial-capture/third-party-payment-captured-amount"
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/shipping_goods" with json:
    """
    {
      "fields": {
        "amount": 60
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
       "message": "Amount is higher than allowed capture amount"
    }
    """

  Scenario: Do shipping goods action with amount greater than allowed amount using "skip validation" endpoint
    Given I authenticate as a user with the following data:
    """
    {
      "id": "2673fa45-82b9-484c-bcbe-46da250c2639",
      "email": "testcases@payever.de",
      "firstName": "Test",
      "lastName": "Test",
      "roles": [
        {
          "name": "oauth",
          "permissions": [
            {
              "acls": [],
              "businessId": "{{businessId}}"
            }
          ]
        }
      ]
    }
    """
    And I mock an axios request with parameters:
    """
    {
      "request": {
        "method": "post",
        "url": "*/api/business/{{businessId}}/integration/stripe/action/action-shipping-goods",
        "body": "{\"fields\":{\"amount\":60},\"paymentId\":\"{{transactionId}}\"}",
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
          "shipping_goods": true
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
            "uuid": "{{transactionId}}"
          }
         ],
        "result": {}
      }
      """
    And I use DB fixture "transactions/partial-capture/third-party-payment-captured-amount"
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/legacy-api-action/shipped" with json:
    """
    {
      "fields": {
        "amount": 60
      }
    }
    """
    Then print last response
    And the response status code should be 200
    And the response should contain json:
    """
    {
       "id": "*",
       "original_id": "*",
       "uuid": "{{transactionId}}"
    }
    """

  Scenario: Do shipping goods action with amount greater than allowed amount (already refunded partly)
    Given I authenticate as a user with the following data:
    """
    {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I use DB fixture "transactions/partial-capture/third-party-payment-refunded-amount"
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/shipping_goods" with json:
    """
    {
      "fields": {
        "amount": 60
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
       "message": "Amount is higher than allowed capture amount"
    }
    """

  Scenario: Do shipping goods action with amount greater than allowed amount (already captured and refunded partly)
    Given I authenticate as a user with the following data:
    """
    {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I use DB fixture "transactions/partial-capture/third-party-payment-captured-and-refunded-amount"
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/shipping_goods" with json:
    """
    {
      "fields": {
        "amount": 60
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
       "message": "Amount is higher than allowed capture amount"
    }
    """

  Scenario: Do shipping goods action with amount
    Given I authenticate as a user with the following data:
    """
    {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I mock an axios request with parameters:
    """
    {
      "request": {
        "method": "post",
        "url": "*/api/business/{{businessId}}/integration/stripe/action/action-shipping-goods",
        "body": "{\"fields\":{\"amount\":50},\"paymentId\":\"{{transactionId}}\"}",
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
          "shipping_goods": true
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
            "uuid": "{{transactionId}}"
          }
         ],
        "result": {}
      }
      """
    And I use DB fixture "transactions/partial-capture/third-party-payment"
    When I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
    """
    {
      "name": "payever.event.payment.action.completed",
      "payload": {
        "payment": {
          "id": "440ec879-7f02-48d4-9ffb-77adfaf79a06",
          "uuid": "{{transactionId}}",
          "amount": 100,
          "total": 100,
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
        "action": "shipping_goods",
        "amount": "50",
        "data": {
          "amount": "50"
        }
      }
    }
    """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    When I send a GET request to "/api/business/{{businessId}}/detail/{{transactionId}}"
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
         "amount_capture_rest": 50,
         "amount_captured": 50,
         "amount_refund_rest": 100,
         "amount_refunded": 0,
         "currency": "EUR",
         "total": 100
       }
    }
    """
