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
    Given I remember as "transactionReference" following value:
      """
      "f3d44333-21e2-4f0f-952b-72ac2dfb8fc9"
      """

  Scenario Outline: Insufficient token permissions
    Given I authenticate as a user with the following data:
      """
      <token>
      """
    When I send a POST request to "<path>" with json:
      """
        {
          "fields": {}
        }
      """
    Then the response status code should be 403
    Examples:
      | path                                                       | token                                                                                                                                           |
      | /api/business/{{businessId}}/{{transactionId}}/action/test | {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "36bf8981-0000-0000-0000-02d9fc6d72c8","acls": []}]}]} |
      | /api/business/{{businessId}}/{{transactionId}}/action/test | {"email": "email@email.com","roles": [{"name": "user","permissions": []}]}                                                                      |
      | /api/admin/{{transactionId}}/action/test                   | {"email": "email@email.com","roles": [{"name": "user","permissions": []}]}                                                                      |


  Scenario Outline: Run payex_creditcard payment action
    Given I authenticate as a user with the following data:
      """
      <token>
      """
    Given I use DB fixture "transactions/run-actions"
    And I get file "features/fixtures/json/run-test-action-payex-request.payload.json" content and remember as "requestPayloadPayex"
    And I mock RPC request "payment_option.payex_creditcard.action" to "rpc_payment_payex" with:
      """
      {
        "requestPayload": {{requestPayloadPayex}},
        "responsePayload": "s:82:\"{\"payload\":{\"status\":\"OK\",\"result\":{\"payment\":{\"amount\":100},\"payment_items\":[]}}}\";"
      }
      """
    And I mock RPC request "payment_option.payex_creditcard.action" to "rpc_payment_payex" with:
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
    When I send a POST request to "<path>" with json:
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
          {
            "action_running": false,
            "santander_applications": [],
            "uuid": "{{transactionId}}"
          }
        ]
      ]
    ]
    """
    Examples:
      | path                                                       | token                                                                                                                     |
      | /api/business/{{businessId}}/{{transactionId}}/action/test | {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]} |
      | /api/admin/{{transactionId}}/action/test                   | {"email": "email@email.com","roles": [{"name": "admin","permissions": []}]}                                               |

  Scenario Outline: Run payment action with file upload
    Given I authenticate as a user with the following data:
      """
      <token>
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
    When I send a POST request to "<path>" with json:
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
          {
            "action_running": false,
            "santander_applications": [],
            "uuid": "{{transactionId}}"
          }
        ]
      ]
    ]
    """
    Examples:
      | path                                                       | token                                                                                                                     |
      | /api/business/{{businessId}}/{{transactionId}}/action/test | {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]} |
      | /api/admin/{{transactionId}}/action/test                   | {"email": "email@email.com","roles": [{"name": "admin","permissions": []}]}                                               |

  Scenario Outline: Run payment action for santander_installment_dk, should remove edit action, because it is not implemented at FE
    Given I authenticate as a user with the following data:
    """
    <token>
    """
    And I use DB fixture "transactions/run-actions-santander-dk"
    And I mock an axios request with parameters:
    """
        {
          "request": {
            "method": "post",
            "url": "*/api/business/{{businessId}}/integration/santander_installment_dk/action/action-list",
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
              "refund": true,
              "edit": true,
              "shipping_goods": false
            }
          }
        }
        """
    When I send a GET request to "<path>"
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
    Examples:
      | path                                                  | token                                                                                                                     |
      | /api/business/{{businessId}}/detail/{{transactionId}} | {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]} |
      | /api/admin/detail/{{transactionId}}                   | {"email": "email@email.com","roles": [{"name": "admin","permissions": []}]}                                               |
    
