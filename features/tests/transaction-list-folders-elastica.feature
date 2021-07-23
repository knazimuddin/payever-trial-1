@transaction-lists-folders
Feature: Folder transaction list for business
  Background:
    Given I remember as "businessId" following value:
      """
      "36bf8981-8827-4c0c-a645-02d9fc6d72c8"
      """
    Given I remember as "folderId" following value:
      """
      "97d9f445-8d7f-4cdf-aa80-7d1bfef7c21f"
      """

  Scenario Outline: get transaction list for root
    Given I authenticate as a user with the following data:
      """
      <token>
      """
    And I use DB fixture "transactions/transactions-list-with-different-currencies"
    And I use DB fixture "transactions/folder-excluded-documents"
    And I get file "features/fixtures/json/transaction-list-elastica/elastic-transactions-list.json" content and remember as "elasticTransactionsListJson"
    And I get file "features/fixtures/json/transaction-list-elastica/elastic-transactions-count.json" content and remember as "elasticTransactionsCountJson"
    And I get file "features/fixtures/json/transaction-list-elastica/elastic-total-by-currencies.json" content and remember as "totalByCurrencies"
    And I get file "features/fixtures/json/transaction-list-elastica/elastic-statuses-response.json" content and remember as "statusesResponse"
    And I get file "features/fixtures/json/transaction-list-elastica/elastic-specific-statuses-response.json" content and remember as "specificStatusesResponse"
    And I get file "features/fixtures/json/transaction-list-elastica/<case_prefix>-transactions-list-response.json" content and remember as "transactionsListJson"
    And I mock Elasticsearch method "search" with:
      """
      {
        "arguments": [
          "transactions",
          {
           "from": 0,
           "query": {
             "bool": {
               "must": <elasticsearch_filter>,
               "must_not": []
             }
           },
           "size": 10,
           "sort": [
             {
               "created_at": "asc"
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
          "transactions",
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
               "must": <elasticsearch_filter>,
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
          "transactions",
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
               "must": <elasticsearch_filter>,
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
          "transactions",
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
               "must": <elasticsearch_filter>,
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
          "transactions",
          {
            "query": {
              "bool": {
                "must": <elasticsearch_filter>,
                "must_not": []
              }
            }
          }
        ],
        "result": {{elasticTransactionsCountJson}}
      }
      """
    When I send a GET request to "<path>"
    And the response status code should be 200
    And print Elasticsearch calls

    Examples:
      | case_prefix | path                                                                    | elasticsearch_filter                                    | token                                                                                                                     |
      | business    | /api/folders/business/{{businessId}}/root-documents                     | [{"match_phrase": {"business_uuid": "{{businessId}}"}}] | {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]} |

  Scenario Outline: get transaction list for folder
    Given I authenticate as a user with the following data:
      """
      <token>
      """
    And I use DB fixture "transactions/transactions-list-with-different-currencies"
    And I use DB fixture "transactions/folder-documents"
    And I get file "features/fixtures/json/transaction-list-elastica/elastic-transactions-list.json" content and remember as "elasticTransactionsListJson"
    And I get file "features/fixtures/json/transaction-list-elastica/elastic-transactions-count.json" content and remember as "elasticTransactionsCountJson"
    And I get file "features/fixtures/json/transaction-list-elastica/elastic-total-by-currencies.json" content and remember as "totalByCurrencies"
    And I get file "features/fixtures/json/transaction-list-elastica/elastic-statuses-response.json" content and remember as "statusesResponse"
    And I get file "features/fixtures/json/transaction-list-elastica/elastic-specific-statuses-response.json" content and remember as "specificStatusesResponse"
    And I get file "features/fixtures/json/transaction-list-elastica/<case_prefix>-transactions-list-response.json" content and remember as "transactionsListJson"
    And I mock Elasticsearch method "search" with:
      """
      {
        "arguments": [
          "transactions",
          {
           "from": 0,
           "query": {
             "bool": {
               "must": <elasticsearch_filter>,
               "must_not": []
             }
           },
           "size": 10,
           "sort": [
             {
               "created_at": "asc"
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
          "transactions",
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
               "must": <elasticsearch_filter>,
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
          "transactions",
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
               "must": <elasticsearch_filter>,
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
          "transactions",
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
               "must": <elasticsearch_filter>,
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
          "transactions",
          {
            "query": {
              "bool": {
                "must": <elasticsearch_filter>,
                "must_not": []
              }
            }
          }
        ],
        "result": {{elasticTransactionsCountJson}}
      }
      """
    When I send a GET request to "<path>"
    And print Elasticsearch calls

    Examples:
      | case_prefix | path                                                                    | elasticsearch_filter                                    | token                                                                                                                     |
      | business    | /api/folders/business/{{businessId}}/folder/{{folderId}}/documents      | [{"match_phrase": {"business_uuid": "{{businessId}}"}}] | {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]} |
