Feature: Transaction details for business
  Scenario: User doesn't have permission to business
    Given I authenticate as a user with the following data:
      """
      {
        "email": "email@email.com",
        "roles": [
          {
            "name": "merchant",
            "permissions": [
              {
                "businessId": "36bf8981-8827-4c0c-a645-02d9fc6d72c8",
                "acls": []
              }
            ]
          }
        ]
      }
      """
    When I send a GET request to "/api/business/2382ffce-5620-4f13-885d-3c069f9dd9b4/detail/95a2904a-815c-4257-81b7-4df3934115f3"
    Then print last response
    And the response status code should be 403

  Scenario: Get transaction details
    Given I authenticate as a user with the following data:
      """
      {
        "email": "email@email.com",
        "roles": [
          {
            "name": "merchant",
            "permissions": [
              {
                "businessId": "36bf8981-8827-4c0c-a645-02d9fc6d72c8",
                "acls": []
              }
            ]
          }
        ]
      }
      """
    And I use DB fixture "transactions/transaction-details"
    And I mock RPC request "payment_option.paypal.action" to "rpc_payment_paypal" with:
      """
      {
        "requestPayload": {
          "action": "action.list"
        },
        "responsePayload": "s:80:\"{\"payload\":{\"status\":\"OK\",\"result\":{\"test_action\":true,\"another_action\":false}}}\";"
      }
      """
    When I send a GET request to "/api/business/36bf8981-8827-4c0c-a645-02d9fc6d72c8/detail/ad738281-f9f0-4db7-a4f6-670b0dff5327"
    Then print last response
    And the response status code should be 200
    And the response should contain json:
      """
      {
         "actions": [],
         "transaction": {
           "original_id": "440ec879-7f02-48d4-9ffb-77adfaf79a06",
           "uuid": "ad738281-f9f0-4db7-a4f6-670b0dff5327",
           "amount": 50,
           "amount_refunded": 0,
           "amount_rest": 50,
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
           "uuid": "36bf8981-8827-4c0c-a645-02d9fc6d72c8"
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
           "type": "paypal"
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
           "general": "Test status",
           "place": "paid",
           "specific": "Test specific status"
         },
         "store": {},
         "user": {}
      }
      """
