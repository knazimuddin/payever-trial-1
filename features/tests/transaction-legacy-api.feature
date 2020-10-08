Feature: Transaction legacy api

  Background:
    Given I remember as "businessId" following value:
      """
      "36bf8981-8827-4c0c-a645-02d9fc6d72c8"
      """

  Scenario: No token provided
    Given I am not authenticated
    When I send a GET request to "/api/legacy-api/transactions/440ec879-7f02-48d4-9ffb-77adfaf79a06"
    Then print last response
    And the response status code should be 403

  Scenario: Fake transaction id provided
    Given I authenticate as a user with the following data:
      """
      {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
      """
    When I send a GET request to "/api/legacy-api/transactions/fake-transaction-id"
    Then print last response
    And the response status code should be 404
    And the response should contain json:
      """
      {"message":"Transaction by id fake-transaction-id not found"}
      """

  Scenario: Getting transaction from another business should be forbidden
    And I authenticate as a user with the following data:
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
              "businessId": "0064bd92-c270-49f4-9910-cfab877c1255"
            }
          ]
        }
      ]
    }
    """
    And I use DB fixture "transactions/transaction-details"
    And I mock RPC request "payment_option.payex_creditcard.action" to "rpc_payment_payex" with:
      """
      {
        "requestPayload": {
          "action": "action.list"
        },
        "responsePayload": "s:80:\"{\"payload\":{\"status\":\"OK\",\"result\":{\"test_action\":true,\"another_action\":false}}}\";"
      }
      """
    When I send a GET request to "/api/legacy-api/transactions/440ec879-7f02-48d4-9ffb-77adfaf79a06"
    Then print last response
    Then the response status code should be 403
    And the response should contain json:
    """
    {
      "statusCode": 403,
      "error": "Forbidden",
      "message": "You're not allowed to get transaction with id 440ec879-7f02-48d4-9ffb-77adfaf79a06"
    }
    """

  Scenario: Get transaction by id
    And I authenticate as a user with the following data:
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
    And I use DB fixture "transactions/transaction-details"
    And I mock RPC request "payment_option.payex_creditcard.action" to "rpc_payment_payex" with:
      """
      {
        "requestPayload": {
          "action": "action.list"
        },
        "responsePayload": "s:80:\"{\"payload\":{\"status\":\"OK\",\"result\":{\"test_action\":true,\"another_action\":false}}}\";"
      }
      """
    When I send a GET request to "/api/legacy-api/transactions/440ec879-7f02-48d4-9ffb-77adfaf79a06"
    Then print last response
    And the response status code should be 200
    And the response should contain json:
      """
      {
        "actions": [
          {
            "action": "test_action",
            "enabled": true
          },
          {
            "action": "another_action",
            "enabled": false
          }
        ],
        "id": "440ec879-7f02-48d4-9ffb-77adfaf79a06",
        "uuid": "ad738281-f9f0-4db7-a4f6-670b0dff5327",
        "address": {
          "salutation": "SALUTATION_MR",
          "first_name": "Test First_name",
          "last_name": "Test Last_name",
          "email": "test@test.com",
          "country": "DE",
          "country_name": "Germany",
          "city": "Hamburg",
          "zip_code": "12345",
          "street": "Rödingsmarkt"
        },
        "action_running": false,
        "amount": 50,
        "business_option_id": 1,
        "business_uuid": "{{businessId}}",
        "channel": "pos",
        "channel_set_uuid": "7c2298a7-a172-4048-8977-dbff24dec100",
        "currency": "EUR",
        "customer_email": "test@test.com",
        "customer_name": "Customer Test",
        "delivery_fee": 2,
        "down_payment": 0,
        "history": [
          {
            "action": "test_action",
            "upload_items": [],
            "refund_items": []
          }
        ],
        "items": [
          {
            "options": [],
            "uuid": "f83c9c9f-77eb-464a-9ef3-95f572301d2c",
            "name": "test item",
            "identifier": "c4bce8c1-6572-43fc-8fc9-0f8f0a5efad1",
            "price": 50,
            "price_net": 10,
            "vat_rate": 10,
            "quantity": 1,
            "thumbnail": "https://payeverstaging.blob.core.windows.net/products/image_test"
          }
        ],
        "merchant_email": "testcases@merchant.com",
        "merchant_name": "Test Merchant",
        "payment_details": {},
        "payment_fee": 0,
        "payment_flow_id": "2",
        "place": "paid",
        "reference": "f3d44333-21e2-4f0f-952b-72ac2dfb8fc9",
        "santander_applications": [],
        "shipping_address": {
          "salutation": "SALUTATION_MR",
          "first_name": "First name Shipping",
          "last_name": "Last_name Shipping",
          "email": "test_shipping@test.com",
          "country": "DE",
          "country_name": "Germany",
          "city": "Hamburg",
          "zip_code": "12345",
          "street": "Rödingsmarkt shipping"
        },
        "shipping_method_name": "some shipping name",
        "specific_status": "Test specific status",
        "status": "Test status",
        "total": 50,
        "type": "payex_creditcard",
        "user_uuid": "08a3fac8-43ef-4998-99aa-cabc97a39261"
      }
      """
