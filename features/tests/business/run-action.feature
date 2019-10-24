Feature: Run payment action
  Background:
    Given I remember as "businessId" following value:
      """
      "36bf8981-8827-4c0c-a645-02d9fc6d72c8"
      """
    Given I remember as "transactionId" following value:
      """
      "ad738281-f9f0-4db7-a4f6-670b0dff5327"
      """
    Given I authenticate as a user with the following data:
      """
      {
        "email": "email@email.com",
        "roles": [
          {
            "name": "merchant",
            "permissions": [
              {
                "businessId": "{{businessId}}",
                "acls": []
              }
            ]
          }
        ]
      }
      """

  Scenario: Run paypal payment action
    Given I use DB fixture "transactions/run-actions"
    And I get file "features/fixtures/json/run-test-action-paypal-request.payload.json" content and remember as "requestPayloadPayPal"
    And I mock RPC request "payment_option.paypal.action" to "rpc_payment_paypal" with:
      """
      {
        "requestPayload": {{requestPayloadPayPal}},
        "responsePayload": "s:82:\"{\"payload\":{\"status\":\"OK\",\"result\":{\"payment\":{\"amount\":100},\"payment_items\":[]}}}\";"
      }
      """
    And I mock RPC request "payment_option.paypal.action" to "rpc_payment_paypal" with:
      """
      {
        "requestPayload": {
          "action": "action.list"
        },
        "responsePayload": "s:80:\"{\"payload\":{\"status\":\"OK\",\"result\":{\"test_action\":true,\"another_action\":false}}}\";"
      }
      """
    And I mock Elasticsearch method "singleIndex" with:
      """
      {
        "arguments": [
          "transactions",
          "transaction",
          {
            "action_running": false,
            "santander_applications": [],
            "uuid": "{{transactionId}}"
          }
         ],
        "result": {}
      }
      """
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/test" with json:
      """
        {
          "fields": {}
        }
      """
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
           "transaction": {
             "uuid": "{{transactionId}}",
             "amount": 100
           },
           "business": {
             "uuid": "{{businessId}}"
           },
           "cart": {
             "available_refund_items": [],
             "items": []
           }
         }
      """
    And RabbitMQ exchange "async_events" should contain following ordered messages:
    """
    [
      {
        "name": "transactions_app.payment.updated",
        "payload": {
          "payment": {
            "uuid": "{{transactionId}}",
            "amount": 100
          }
        }
      }
    ]
    """
    And print Elasticsearch calls
    And Elasticsearch calls stack should contain following ordered messages:
    """
    [
      [
        "singleIndex",
        [
          "transactions",
          "transaction",
          {
            "action_running": false,
            "santander_applications": [],
            "uuid": "{{transactionId}}"
          }
        ]
      ]
    ]
    """

  Scenario: Run payment action with file upload
    Given I authenticate as a user with the following data:
      """
      {
        "email": "email@email.com",
        "roles": [
          {
            "name": "merchant",
            "permissions": [
              {
                "businessId": "{{businessId}}",
                "acls": []
              }
            ]
          }
        ]
      }
      """
    And I use DB fixture "transactions/run-actions-file-upload"
    And I get file "features/fixtures/json/run-santander-de-action-file-upload.payload.json" content and remember as "requestPayload"
    And I mock RPC request "payment_option.santander_installment.action" to "rpc_payment_santander_de" with:
      """
      {
        "requestPayload": {{requestPayload}},
        "responsePayload": "s:82:\"{\"payload\":{\"status\":\"OK\",\"result\":{\"payment\":{\"amount\":100},\"payment_items\":[]}}}\";"
      }
      """
    And I mock RPC request "payment_option.santander_installment.action" to "rpc_payment_santander_de" with:
      """
      {
        "requestPayload": {
          "action": "action.list"
        },
        "responsePayload": "s:80:\"{\"payload\":{\"status\":\"OK\",\"result\":{\"test_action\":true,\"another_action\":false}}}\";"
      }
      """
    And I mock Elasticsearch method "singleIndex" with:
      """
      {
        "arguments": [
          "transactions",
          "transaction",
          {
            "action_running": false,
            "santander_applications": [],
            "uuid": "{{transactionId}}"
          }
         ],
        "result": {}
      }
      """
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/test" with json:
      """
        {
          "fields": {},
          "files": [
            {
              "url": "http://test.file/url"
            },
            {
              "url": "http://test.file/url with spaces"
            }
          ]
        }
      """
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
           "transaction": {
             "uuid": "{{transactionId}}",
             "amount": 100
           },
           "business": {
             "uuid": "{{businessId}}"
           },
           "cart": {
             "available_refund_items": [],
             "items": []
           }
         }
      """
    And RabbitMQ exchange "async_events" should contain following ordered messages:
    """
    [
      {
        "name": "transactions_app.payment.updated",
        "payload": {
          "payment": {
            "uuid": "{{transactionId}}"
          }
        }
      }
    ]
    """
    And print Elasticsearch calls
    And Elasticsearch calls stack should contain following ordered messages:
    """
    [
      [
        "singleIndex",
        [
          "transactions",
          "transaction",
          {
            "action_running": false,
            "santander_applications": [],
            "uuid": "{{transactionId}}"
          }
        ]
      ]
    ]
    """

  Scenario: Run payment action for santander_installment_dk, should remove edit action, because it is not implemented at FE
    Given I authenticate as a user with the following data:
      """
      {
        "email": "email@email.com",
        "roles": [
          {
            "name": "merchant",
            "permissions": [
              {
                "businessId": "{{businessId}}",
                "acls": []
              }
            ]
          }
        ]
      }
      """
    And I use DB fixture "transactions/run-actions-santander-dk"
    And I mock RPC request "payment_option.santander_installment_dk.action" to "rpc_payment_santander_dk" with:
      """
      {
        "requestPayload": {
          "action": "action.do"
        },
        "responsePayload": "s:82:\"{\"payload\":{\"status\":\"OK\",\"result\":{\"payment\":{\"amount\":100},\"payment_items\":[]}}}\";"
      }
      """
    And I mock RPC request "payment_option.santander_installment_dk.action" to "rpc_payment_santander_dk" with:
      """
      {
        "requestPayload": {
          "action": "action.list"
        },
        "responsePayload": "s:94:\"{\"payload\":{\"status\":\"OK\",\"result\":{\"test_action\":true,\"edit\":false, \"another_action\": true}}}\";"
      }
      """
    And I mock Elasticsearch method "singleIndex" with:
      """
      {
        "arguments": [
          "transactions",
          "transaction",
          {
            "action_running": false,
            "santander_applications": [],
            "uuid": "{{transactionId}}"
          }
         ],
        "result": {}
      }
      """
    When I send a POST request to "/api/business/{{businessId}}/{{transactionId}}/action/test" with json:
      """
        {
          "fields": {},
          "files": [
            {
              "url": "http://test.file/url"
            },
            {
              "url": "http://test.file/url with spaces"
            }
          ]
        }
      """
    Then print last response
    And the response status code should be 200
    And the response should not contain json:
      """
        {
           "actions": [
             {
               "action": "edit",
               "enabled": true
             }
           ]
         }
      """
    And print Elasticsearch calls
    And Elasticsearch calls stack should contain following ordered messages:
    """
    [
      [
        "singleIndex",
        [
          "transactions",
          "transaction",
          {
            "action_running": false,
            "santander_applications": [],
            "uuid": "{{transactionId}}"
          }
        ]
      ]
    ]
    """
