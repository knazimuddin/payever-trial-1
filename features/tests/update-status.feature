Feature: Update transaction status

  Background:
    Given I remember as "businessId" following value:
      """
      "36bf8981-8827-4c0c-a645-02d9fc6d72c8"
      """
    Given I remember as "transactionId" following value:
      """
      "ad738281-f9f0-4db7-a4f6-670b0dff5327"
      """

  Scenario Outline: Insufficient token permissions
    Given I remember as "anotherBusinessId" following value:
      """
      "2382ffce-5620-4f13-885d-3c069f9dd9b4"
      """
    Given I authenticate as a user with the following data:
      """
      <token>
      """
    When I send a GET request to "<path>"
    Then print last response
    And the response status code should be 403
    Examples:
      | path                                                         | token                                                                                                                            |
      | /api/business/{{businessId}}/{{transactionId}}/update-status | {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{anotherBusinessId}}","acls": []}]}]} |
      | /api/admin/{{transactionId}}/update-status                   | {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}        |
      | /api/admin/{{transactionId}}/update-status                   | {"email": "email@email.com","roles": [{"name": "user","permissions": []}]}                                                       |
      | /api/business/{{businessId}}/{{transactionId}}/update-status | {"email": "email@email.com","roles": [{"name": "user","permissions": []}]}                                                       |

  Scenario Outline: Transaction not found
    Given I authenticate as a user with the following data:
      """
      <token>
      """
    When I send a GET request to "<path>"
    And print last response
    Then the response status code should be 404
    Examples:
      | path                                                         | token                                                                                                                     |
      | /api/business/{{businessId}}/{{transactionId}}/update-status | {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]} |
      | /api/admin/{{transactionId}}/update-status                   | {"email": "email@email.com","roles": [{"name": "admin","permissions": []}]}                                               |

  Scenario Outline: RPC call failed
    Given I authenticate as a user with the following data:
      """
      <token>
      """
    When I mock RPC request "payment_option.payex_creditcard.payment" to "rpc_payment_payex_status" with:
      """
      {
        "requestPayload": {
          "action": "status"
        },
        "responsePayload": "s:228:\"{\"payload\":{\"status\":\"ERROR\",\"result\":{\"payment\":{\"amount\":50, \"delivery_fee\":2, \"status\":\"Status paid\", \"specific_status\": \"Specific status paid\", \"reference\": \"f3d44333-21e2-4f0f-952b-72ac2dfb8fc9\"},\"workflow_state\": \"paid\"}}}\";"
      }
      """
    And I use DB fixture "transactions/transaction-details"
    When I send a GET request to "<path>"
    And print last response
    Then the response status code should be 400
    Examples:
      | path                                                         | token                                                                                                                     |
      | /api/business/{{businessId}}/{{transactionId}}/update-status | {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]} |
      | /api/admin/{{transactionId}}/update-status                   | {"email": "email@email.com","roles": [{"name": "admin","permissions": []}]}                                               |

  Scenario Outline: Update status
    Given I authenticate as a user with the following data:
      """
      <token>
      """
    And I mock RPC request "payment_option.payex_creditcard.payment" to "rpc_payment_payex_status" with:
      """
      {
        "requestPayload": {
          "action": "status"
        },
        "responsePayload": "s:225:\"{\"payload\":{\"status\":\"OK\",\"result\":{\"payment\":{\"amount\":50, \"delivery_fee\":2, \"status\":\"Status paid\", \"specific_status\": \"Specific status paid\", \"reference\": \"f3d44333-21e2-4f0f-952b-72ac2dfb8fc9\"},\"workflow_state\": \"paid\"}}}\";"
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
    And I mock RPC request "payment_option.payex_creditcard.action" to "rpc_payment_payex" with:
      """
      {
        "requestPayload": {
          "action": "action.list"
        },
        "responsePayload": "s:80:\"{\"payload\":{\"status\":\"OK\",\"result\":{\"test_action\":true,\"another_action\":false}}}\";"
      }
      """
    And I use DB fixture "transactions/transaction-details"
    When I send a GET request to "<path>"
    And print last response
    Then the response status code should be 200
    And RabbitMQ exchange "async_events" should contain following ordered messages:
      """
      [
        {
          "name": "transactions_app.payment.updated",
          "payload": {
            "payment": {
              "uuid": "{{transactionId}}",
              "amount": 50
            }
          }
        }
      ]
      """
    Examples:
      | path                                                         | token                                                                                                                     |
      | /api/business/{{businessId}}/{{transactionId}}/update-status | {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]} |
      | /api/admin/{{transactionId}}/update-status                   | {"email": "email@email.com","roles": [{"name": "admin","permissions": []}]}                                               |


  Scenario Outline: Update status with not allowed status
    Given I authenticate as a user with the following data:
      """
      <token>
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
    And I use DB fixture "transactions/transaction-details-paid"
    When I send a GET request to "<path>"
    And print last response
    Then the response status code should be 200
    Examples:
      | path                                                         | token                                                                                                                     |
      | /api/business/{{businessId}}/{{transactionId}}/update-status | {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]} |
      | /api/admin/{{transactionId}}/update-status                   | {"email": "email@email.com","roles": [{"name": "admin","permissions": []}]}                                               |
