@export-bus-message
Feature: Transaction export for business
  Background:
    Given I remember as "businessId" following value:
      """
      "36bf8981-8827-4c0c-a645-02d9fc6d72c8"
      """
    Given I remember as "anotherBusinessId" following value:
      """
      "2382ffce-5620-4f13-885d-3c069f9dd9b4"
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

  Scenario: Export transactions by message
    Given I use DB fixture "transactions/transactions-list-with-different-currencies"
    And I get file "features/fixtures/json/transaction-list-elastica/elastic-transactions-list.json" content and remember as "elasticTransactionsListJson"
    And I get file "features/fixtures/json/transaction-list-elastica/elastic-transactions-count.json" content and remember as "elasticTransactionsCountJson"
    And I get file "features/fixtures/json/transaction-list-elastica/elastic-total-by-currencies.json" content and remember as "totalByCurrencies"
    And I get file "features/fixtures/json/transaction-list-elastica/elastic-statuses-response.json" content and remember as "statusesResponse"
    And I get file "features/fixtures/json/transaction-list-elastica/elastic-specific-statuses-response.json" content and remember as "specificStatusesResponse"
    And I get file "features/fixtures/json/transaction-list-elastica/business-transactions-list-response.json" content and remember as "transactionsListJson"
    And I mock Elasticsearch method "search" with:
      """
      {
        "arguments": [
          "folder_transactions",
          {
            "from": 0,
            "query": {
              "bool": {
                "must": [
                  {
                    "match_phrase": {
                      "business_uuid": "{{businessId}}"
                    }
                  }
                ],
                "must_not": []
              }
            },
            "size": 20,
            "sort": [
              {
                "created_at": "desc"
              }
            ]
          }
        ],
        "result": {{elasticTransactionsListJson}}
      }
      """
    And I mock Elasticsearch method "search" with:
      """
      {
        "arguments": [
          "folder_transactions",
          {
           "aggs": {
             "total_amount": {
               "aggs": {
                 "total_amount": {
                   "sum": {
                     "field": "total"
                   }
                 }
               },
               "terms": {
                 "field": "currency"
               }
             }
           },
           "from": 0,
           "query": {
             "bool": {
               "must": [
                 {
                   "match_phrase": {
                     "business_uuid": "{{businessId}}"
                   }
                 }
               ],
               "must_not": []
             }
           }
          }
        ],
        "result": {{totalByCurrencies}}
      }
      """
    And I mock Elasticsearch method "search" with:
      """
      {
        "arguments": [
          "folder_transactions",
          {
           "aggs": {
             "status": {
               "terms": {
                 "field": "status"
               }
             }
           },
           "from": 0,
           "query": {
             "bool": {
               "must": [
                 {
                   "match_phrase": {
                     "business_uuid": "{{businessId}}"
                   }
                 }
               ],
               "must_not": []
             }
           }
          }
        ],
        "result": {{statusesResponse}}
      }
      """
    And I mock Elasticsearch method "search" with:
      """
      {
        "arguments": [
          "folder_transactions",
          {
           "aggs": {
             "specific_status": {
               "terms": {
                 "field": "specific_status"
               }
             }
           },
           "from": 0,
           "query": {
             "bool": {
               "must": [
                 {
                   "match_phrase": {
                     "business_uuid": "{{businessId}}"
                   }
                 }
               ],
               "must_not": []
             }
           }
          }
        ],
        "result": {{specificStatusesResponse}}
      }
      """
    And I mock Elasticsearch method "count" with:
      """
      {
        "arguments": [
          "folder_transactions",
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "match_phrase": {
                      "business_uuid": "{{businessId}}"
                    }
                  }
                ],
                "must_not": []
              }
            }
          }
        ],
        "result": {{elasticTransactionsCountJson}}
      }
      """
    Given I publish in RabbitMQ channel "async_events_transactions_export_micro" message with json:
    """
    {
      "name":"transactions.event.export",
      "payload": {
        "businessId": "{{businessId}}",
        "exportDto": {
          "direction": "desc",
          "page": 1,
          "limit": 20,
          "filters": {},
          "format": "csv",
          "businessName": "test",
          "columns": "[{\"name\":\"type\",\"title\":\"Payment type\",\"isActive\":true,\"isToggleable\":true},{\"name\":\"customer_name\",\"title\":\"Customer name\",\"isActive\":true,\"isToggleable\":true},{\"name\":\"merchant_name\",\"title\":\"Merchant name\",\"isActive\":true,\"isToggleable\":true},{\"name\":\"created_at\",\"title\":\"Date\",\"isActive\":true,\"isToggleable\":true},{\"name\":\"status\",\"title\":\"Status\",\"isActive\":true,\"isToggleable\":true}]",
          "orderBy": "created_at",
          "currency": "EUR"
        }
      }
    }
    """
    And I process messages from RabbitMQ "async_events_transactions_export_micro" channel
