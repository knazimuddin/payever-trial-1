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

  Scenario: User doesn't have permission to business
    When I send a GET request to "/api/business/{{anotherBusinessId}}/export"
    Then print last response
    And the response status code should be 403

  Scenario: Export transactions for business
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
            "size": 10000,
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
    When I send a GET request to "/api/business/{{businessId}}/export?orderBy=created_at&direction=desc&limit=20&page=1&currency=EUR&format=csv&businessName=test&columns=%5B%7B%22name%22:%22type%22,%22title%22:%22Payment%20type%22,%22isActive%22:true,%22isToggleable%22:true%7D,%7B%22name%22:%22customer_name%22,%22title%22:%22Customer%20name%22,%22isActive%22:true,%22isToggleable%22:true%7D,%7B%22name%22:%22merchant_name%22,%22title%22:%22Merchant%20name%22,%22isActive%22:true,%22isToggleable%22:true%7D,%7B%22name%22:%22created_at%22,%22title%22:%22Date%22,%22isActive%22:true,%22isToggleable%22:true%7D,%7B%22name%22:%22status%22,%22title%22:%22Status%22,%22isActive%22:true,%22isToggleable%22:true%7D%5D"
    Then print last response
    And the response status code should be 200
