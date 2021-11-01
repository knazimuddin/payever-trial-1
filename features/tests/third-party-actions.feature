Feature: Third party payment actions

  Background:
    Given I remember as "businessId" following value:
    """
    "36bf8981-8827-4c0c-a645-02d9fc6d72c8"
    """
    Given I remember as "transactionId" following value:
    """
    "ad738281-f9f0-4db7-a4f6-670b0dff5327"
    """

  Scenario: Get third party payment actions list
    Given I authenticate as a user with the following data:
    """
    {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I mock an axios request with parameters:
    """
    {
      "request": {
        "method": "post",
        "url": "*/api/business/{{businessId}}/integration/instant_payment/action/action-list",
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
    And I use DB fixture "transactions/third-party-payment"
    When I send a GET request to "/api/business/{{businessId}}/detail/{{transactionId}}"
    Then print last response
    And the response status code should be 200
    And the response should contain json:
    """
    {
       "actions": [
         {
            "action": "shipping_goods",
            "enabled": true
         }
       ],
       "transaction": {
         "original_id": "ad738281-f9f0-4db7-a4f6-670b0dff5327",
         "uuid": "{{transactionId}}",
         "amount": 50,
         "amount_refunded": 0,
         "amount_refund_rest": 50,
         "currency": "EUR",
         "total": 50
       },
       "billing_address": {
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
       "business": {
         "uuid": "{{businessId}}"
       },
       "cart": {
         "available_refund_items": [
           {
             "count": 1,
             "item_uuid": "f83c9c9f-77eb-464a-9ef3-95f572301d2c"
           }
         ],
         "items": [
           {
             "uuid": "f83c9c9f-77eb-464a-9ef3-95f572301d2c",
             "name": "test item",
             "identifier": "c4bce8c1-6572-43fc-8fc9-0f8f0a5efad1",
             "price": 50,
             "price_net": 10,
             "vat_rate": 10,
             "quantity": 1,
             "thumbnail": "https://payeverstaging.blob.core.windows.net/products/image_test"
           }
         ]
       },
       "channel": {
         "name": "pos"
       },
       "channel_set": {
         "uuid": "7c2298a7-a172-4048-8977-dbff24dec100"
       },
       "customer": {
         "email": "test@test.com",
         "name": "Customer Test"
       },
       "details": {
         "order": {
           "reference": "f3d44333-21e2-4f0f-952b-72ac2dfb8fc9"
         }
       },
       "history": [
         {
           "refund_items": [],
           "upload_items": [],
           "action": "test_action"
         }
       ],
       "merchant": {
         "email": "testcases@merchant.com",
         "name": "Test Merchant"
       },
       "payment_flow": {
         "id": "2"
       },
       "payment_option": {
         "down_payment": 0,
         "id": 1,
         "payment_fee": 0,
         "type": "instant_payment"
       },
       "shipping": {
         "address": {
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
         "delivery_fee": 2,
         "method_name": "some shipping name",
         "order_id": "5db105b8-2da6-421e-8e6a-1c67048cda2b"
       },
       "status": {
         "general": "STATUS_ACCEPTED",
         "place": "paid",
         "specific": "NONE"
       },
       "store": {},
       "user": {}
    }
    """

  Scenario: Do third party payment shipping goods action
    Given I authenticate as a user with the following data:
    """
    {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I mock an axios request with parameters:
    """
    {
      "request": {
        "method": "post",
        "url": "*/api/business/{{businessId}}/integration/instant_payment/action/action-list",
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
          "shipping_goods": false
        }
      }
    }
    """
    And I mock an axios request with parameters:
    """
    {
      "request": {
        "method": "post",
        "url": "*/api/business/{{businessId}}/integration/instant_payment/action/action-shipping-goods",
        "body": "{\"paymentId\":\"{{transactionId}}\"}",
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
    And I use DB fixture "transactions/third-party-payment"
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/shipping_goods" with json:
    """
    {}
    """
    Then print last response
    And the response status code should be 200
    And the response should contain json:
    """
    {
       "actions": [
         {
           "action": "shipping_goods",
           "enabled": false
         }
       ],
       "transaction": {
         "original_id": "ad738281-f9f0-4db7-a4f6-670b0dff5327",
         "uuid": "{{transactionId}}",
         "amount": 50,
         "amount_refunded": 0,
         "amount_refund_rest": 50,
         "currency": "EUR",
         "total": 50
       },
       "billing_address": {
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
       "business": {
         "uuid": "{{businessId}}"
       },
       "cart": {
         "available_refund_items": [
           {
             "count": 1,
             "item_uuid": "f83c9c9f-77eb-464a-9ef3-95f572301d2c"
           }
         ],
         "items": [
           {
             "uuid": "f83c9c9f-77eb-464a-9ef3-95f572301d2c",
             "name": "test item",
             "identifier": "c4bce8c1-6572-43fc-8fc9-0f8f0a5efad1",
             "price": 50,
             "price_net": 10,
             "vat_rate": 10,
             "quantity": 1,
             "thumbnail": "https://payeverstaging.blob.core.windows.net/products/image_test"
           }
         ]
       },
       "channel": {
         "name": "pos"
       },
       "channel_set": {
         "uuid": "7c2298a7-a172-4048-8977-dbff24dec100"
       },
       "customer": {
         "email": "test@test.com",
         "name": "Customer Test"
       },
       "details": {
         "order": {
           "reference": "f3d44333-21e2-4f0f-952b-72ac2dfb8fc9"
         }
       },
       "history": [
         {
           "refund_items": [],
           "upload_items": [],
           "action": "test_action"
         },
         {
           "action": "shipping_goods",
           "amount": 50,
           "payment_status": "STATUS_ACCEPTED",
           "reason": "",
           "refund_items": [],
           "upload_items": []
         }
       ],
       "merchant": {
         "email": "testcases@merchant.com",
         "name": "Test Merchant"
       },
       "payment_flow": {
         "id": "2"
       },
       "payment_option": {
         "down_payment": 0,
         "id": 1,
         "payment_fee": 0,
         "type": "instant_payment"
       },
       "shipping": {
         "address": {
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
         "delivery_fee": 2,
         "method_name": "some shipping name",
         "order_id": "5db105b8-2da6-421e-8e6a-1c67048cda2b"
       },
       "status": {
         "general": "STATUS_ACCEPTED",
         "place": "paid",
         "specific": "NONE"
       },
       "store": {},
       "user": {}
    }
    """

  Scenario: Do third party payment partial refund action with reason
    Given I authenticate as a user with the following data:
    """
    {"id": "test_id", "firstName": "test_first", "lastName": "test_last", "email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I mock an axios request with parameters:
    """
    {
      "request": {
        "method": "post",
        "url": "*/api/business/{{businessId}}/integration/instant_payment/action/action-list",
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
          "shipping_goods": false,
          "refund": true
        }
      }
    }
    """
    And I mock an axios request with parameters:
    """
    {
      "request": {
        "method": "post",
        "url": "*/api/business/{{businessId}}/integration/instant_payment/action/action-refund",
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
          "payment": {
            "status": "STATUS_REFUNDED"
          }
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
    And I use DB fixture "transactions/third-party-payment"
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/refund" with json:
    """
    {
      "fields": {
        "amount": 10,
        "reason": "out of stock"
      }
    }
    """
    Then print last response
    And the response status code should be 200
    And the response should contain json:
    """
    {
       "actions": [
         {
           "action": "shipping_goods",
           "enabled": false
         },
         {
           "action": "refund",
           "enabled": true
         }
       ],
       "transaction": {
         "original_id": "ad738281-f9f0-4db7-a4f6-670b0dff5327",
         "uuid": "{{transactionId}}",
         "amount": 50,
         "amount_refunded": 10,
         "amount_refund_rest": 40,
         "currency": "EUR",
         "total": 50
       },
       "billing_address": {
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
       "business": {
         "uuid": "{{businessId}}"
       },
       "cart": {
         "available_refund_items": [
           {
             "count": 1,
             "item_uuid": "f83c9c9f-77eb-464a-9ef3-95f572301d2c"
           }
         ],
         "items": [
           {
             "uuid": "f83c9c9f-77eb-464a-9ef3-95f572301d2c",
             "name": "test item",
             "identifier": "c4bce8c1-6572-43fc-8fc9-0f8f0a5efad1",
             "price": 50,
             "price_net": 10,
             "vat_rate": 10,
             "quantity": 1,
             "thumbnail": "https://payeverstaging.blob.core.windows.net/products/image_test"
           }
         ]
       },
       "channel": {
         "name": "pos"
       },
       "channel_set": {
         "uuid": "7c2298a7-a172-4048-8977-dbff24dec100"
       },
       "customer": {
         "email": "test@test.com",
         "name": "Customer Test"
       },
       "details": {
         "order": {
           "reference": "f3d44333-21e2-4f0f-952b-72ac2dfb8fc9"
         }
       },
       "history": [
         {
           "refund_items": [],
           "upload_items": [],
           "action": "test_action"
         },
         {
           "action": "refund",
           "amount": 10,
           "payment_status": "STATUS_REFUNDED",
           "reason": "out of stock",
           "refund_items": [],
           "upload_items": [],
           "user": {
              "email":"email@email.com",
              "first_name":"test_first",
              "id":"test_id",
              "last_name":"test_last"
           }
         }
       ],
       "merchant": {
         "email": "testcases@merchant.com",
         "name": "Test Merchant"
       },
       "payment_flow": {
         "id": "2"
       },
       "payment_option": {
         "down_payment": 0,
         "id": 1,
         "payment_fee": 0,
         "type": "instant_payment"
       },
       "shipping": {
         "address": {
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
         "delivery_fee": 2,
         "method_name": "some shipping name",
         "order_id": "5db105b8-2da6-421e-8e6a-1c67048cda2b"
       },
       "status": {
         "general": "STATUS_REFUNDED",
         "place": "paid",
         "specific": "NONE"
       },
       "store": {},
       "user": {}
    }
    """

  Scenario: Update status on third party transaction
    Given I authenticate as a user with the following data:
    """
    {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I mock an axios request with parameters:
    """
    {
      "request": {
        "method": "post",
        "url": "*/api/business/{{businessId}}/integration/santander_installment_at/action/update-status",
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
          "id": "{{transactionId}}",
          "payment": {
            "status": "STATUS_ACCEPTED",
            "specificStatus": "DELIVERY_RELEASE"
          }
        }
      }
    }
    """
    And I mock an axios request with parameters:
    """
    {
      "request": {
        "method": "post",
        "url": "*/api/business/{{businessId}}/integration/santander_installment_at/action/action-list",
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
    And I use DB fixture "transactions/third-party-payment-status-update"
    When I send a GET request to "/api/business/{{businessId}}/{{transactionId}}/update-status"
    Then print last response
    And the response status code should be 200
    And the response should contain json:
    """
    {
       "actions": [
         {
            "action": "shipping_goods",
            "enabled": true
         }
       ],
       "transaction": {
         "original_id": "{{transactionId}}",
         "uuid": "{{transactionId}}",
         "amount": 50,
         "amount_refunded": 0,
         "amount_refund_rest": 50,
         "currency": "EUR",
         "total": 50
       },
       "billing_address": {
         "salutation": "SALUTATION_MR",
         "first_name": "Test First_name",
         "last_name": "Test Last_name",
         "email": "test@test.com",
         "country": "AT",
         "country_name": "Austria",
         "city": "Wien",
         "zip_code": "1012",
         "street": "Rödingsmarkt"
       },
       "business": {
         "uuid": "{{businessId}}"
       },
       "cart": {
         "available_refund_items": [
           {
             "count": 1,
             "item_uuid": "f83c9c9f-77eb-464a-9ef3-95f572301d2c"
           }
         ],
         "items": [
           {
             "uuid": "f83c9c9f-77eb-464a-9ef3-95f572301d2c",
             "name": "test item",
             "identifier": "c4bce8c1-6572-43fc-8fc9-0f8f0a5efad1",
             "price": 50,
             "price_net": 10,
             "vat_rate": 10,
             "quantity": 1,
             "thumbnail": "https://payeverstaging.blob.core.windows.net/products/image_test"
           }
         ]
       },
       "channel": {
         "name": "pos"
       },
       "channel_set": {
         "uuid": "7c2298a7-a172-4048-8977-dbff24dec100"
       },
       "customer": {
         "email": "test@test.com",
         "name": "Customer Test"
       },
       "details": {
         "order": {
           "reference": "f3d44333-21e2-4f0f-952b-72ac2dfb8fc9"
         }
       },
       "history": [
         {
           "refund_items": [],
           "upload_items": [],
           "action": "test_action"
         }
       ],
       "merchant": {
         "email": "testcases@merchant.com",
         "name": "Test Merchant"
       },
       "payment_flow": {
         "id": "2"
       },
       "payment_option": {
         "down_payment": 0,
         "id": 1,
         "payment_fee": 0,
         "type": "santander_installment_at"
       },
       "shipping": {
         "address": {
           "salutation": "SALUTATION_MR",
           "first_name": "First name Shipping",
           "last_name": "Last_name Shipping",
           "email": "test_shipping@test.com",
           "country": "AT",
           "country_name": "Austria",
           "city": "Wien",
           "zip_code": "1012",
           "street": "Rödingsmarkt shipping"
         },
         "delivery_fee": 2,
         "method_name": "some shipping name",
         "order_id": "5db105b8-2da6-421e-8e6a-1c67048cda2b"
       },
       "status": {
         "general": "STATUS_ACCEPTED",
         "place": "paid",
         "specific": "DELIVERY_RELEASE"
       },
       "store": {},
       "user": {}
    }
    """
