Feature: Transactions archive

  Background:
    Given I remember as "businessId" following value:
    """
    "36bf8981-8827-4c0c-a645-02d9fc6d72c8"
    """
    Given I remember as "transactionId" following value:
    """
    "ad738281-f9f0-4db7-a4f6-670b0dff5327"
    """

  Scenario: Archive transaction
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
    And I mock Elasticsearch method "deleteByQuery" with:
    """
    {
      "arguments": [
        "folder_transactions",
        {
          "query": {
            "match_phrase": {
              "serviceEntityId": "{{transactionId}}"
            }
          }
        }
       ],
      "result": {}
    }
    """
    And I mock Elasticsearch method "deleteByQuery" with:
    """
    {
      "arguments": [
        "transactions",
        {
          "query": {
            "match_phrase": {
              "uuid": "{{transactionId}}"
            }
          }
        }
       ],
      "result": {}
    }
    """
    And I use DB fixture "transactions-archive/transactions"
    When I send a POST request to "/api/business/{{businessId}}/transaction/{{transactionId}}/archive"
    Then print last response
    Then the response status code should be 200
    And look for model "TransactionsArchive" by following JSON and remember as "transaction":
    """
    {
      "uuid": "{{transactionId}}"
    }
    """
    And stored value "transaction" should contain json:
    """
    {
      "uuid": "{{transactionId}}"
    }
    """
    And model "Transaction" found by following JSON should not exist:
    """
    {
      "uuid": "{{transactionId}}"
    }
    """
