Feature: Transaction list for business
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
    When I send a GET request to "/api/business/{{anotherBusinessId}}/list?orderBy=created_at&direction=desc&limit=20&query=&page=1&currency=EUR"
    Then print last response
    And the response status code should be 403

  Scenario: Transactions have different currencies, total amount should be converted to the business currency
    Given I use DB fixture "transactions/business-transactions-list-with-different-currencies"
    And I get file "features/fixtures/json/business-transaction-list/elastic-transactions-list.json" content and remember as "elasticTransactionsListJson"
    And I get file "features/fixtures/json/business-transaction-list/elastic-total-by-currencies.json" content and remember as "totalByCurrencies"
    And I get file "features/fixtures/json/business-transaction-list/elastic-statuses-response.json" content and remember as "statusesResponse"
    And I get file "features/fixtures/json/business-transaction-list/elastic-specific-statuses-response.json" content and remember as "specificStatusesResponse"
    And I get file "features/fixtures/json/business-transaction-list/transactions-list-response.json" content and remember as "transactionsListJson"
    And I mock Elasticsearch method "search" with:
      """
      {
        "arguments": [
          "transactions",
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
    When I send a GET request to "/api/business/{{businessId}}/list"
    Then print last response
    And the response status code should be 200
    And the response should contain json:
      """
      {{transactionsListJson}}
      """

  Scenario: Sending request with filter, should build valid filters for elasticsearch
    Given I mock Elasticsearch method "search" with:
      """
      {
        "arguments": [
          "transactions",
          {
            "from": 0,
            "query": {
              "bool": {
                "must": [
                  {
                    "match_phrase": {
                      "currency": "AFN"
                    }
                  },
                  {
                    "query_string": {
                      "fields": [
                        "original_id^1"
                      ],
                      "query": "asd*"
                    }
                  },
                  {
                    "query_string": {
                      "fields": [
                        "reference^1"
                      ],
                      "query": "*testContains*"
                    }
                  },
                  {
                    "match_phrase": {
                      "business_uuid": "{{businessId}}"
                    }
                  },
                  {
                    "query_string": {
                      "fields": [
                        "original_id^1",
                        "customer_name^1",
                        "merchant_name^1",
                        "reference^1",
                        "payment_details.finance_id^1",
                        "payment_details.application_no^1",
                        "customer_email^1"
                      ],
                      "query": "*test query*"
                    }
                  }
                ],
                "must_not": [
                  {
                    "match_phrase": {
                      "type": "cash"
                    }
                  }
                ]
              }
            },
            "size": 20,
            "sort": [
              {
                "total": "desc"
              }
            ]
          }
        ],
        "result": {
          "body": {
            "hits": {
               "total": 0,
               "max_score": null,
               "hits": []
            }
          }
        }
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
                 "must": [
                   {
                     "match_phrase": {
                       "currency": "AFN"
                     }
                   },
                   {
                     "query_string": {
                       "fields": [
                         "original_id^1"
                       ],
                       "query": "asd*"
                     }
                   },
                   {
                     "query_string": {
                       "fields": [
                         "reference^1"
                       ],
                       "query": "*testContains*"
                     }
                   },
                   {
                     "match_phrase": {
                       "business_uuid": "{{businessId}}"
                     }
                   },
                   {
                     "query_string": {
                       "fields": [
                         "original_id^1",
                         "customer_name^1",
                         "merchant_name^1",
                         "reference^1",
                         "payment_details.finance_id^1",
                         "payment_details.application_no^1",
                         "customer_email^1"
                       ],
                       "query": "*test query*"
                     }
                   }
                 ],
                 "must_not": [
                   {
                     "match_phrase": {
                       "type": "cash"
                     }
                   }
                 ]
               }
             }
           }
         ],
        "result": {
          "body": {
            "hits": {
               "total": 0,
               "max_score": null,
               "hits": []
             },
             "aggregations": {
              "status": {
                "buckets" : []
              }
            }
          }
        }
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
                 "must": [
                   {
                     "match_phrase": {
                       "currency": "AFN"
                     }
                   },
                   {
                     "query_string": {
                       "fields": [
                         "original_id^1"
                       ],
                       "query": "asd*"
                     }
                   },
                   {
                     "query_string": {
                       "fields": [
                         "reference^1"
                       ],
                       "query": "*testContains*"
                     }
                   },
                   {
                     "match_phrase": {
                       "business_uuid": "{{businessId}}"
                     }
                   },
                   {
                     "query_string": {
                       "fields": [
                         "original_id^1",
                         "customer_name^1",
                         "merchant_name^1",
                         "reference^1",
                         "payment_details.finance_id^1",
                         "payment_details.application_no^1",
                         "customer_email^1"
                       ],
                       "query": "*test query*"
                     }
                   }
                 ],
                 "must_not": [
                   {
                     "match_phrase": {
                       "type": "cash"
                     }
                   }
                 ]
               }
             }
           }
        ],
        "result": {
          "body": {
            "hits": {
               "total": 0,
               "max_score": null,
               "hits": []
             },
             "aggregations": {
              "specific_status": {
                "buckets" : []
              }
            }
          }
        }
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
                 "must": [
                   {
                     "match_phrase": {
                       "currency": "AFN"
                     }
                   },
                   {
                     "query_string": {
                       "fields": [
                         "original_id^1"
                       ],
                       "query": "asd*"
                     }
                   },
                   {
                     "query_string": {
                       "fields": [
                         "reference^1"
                       ],
                       "query": "*testContains*"
                     }
                   },
                   {
                     "match_phrase": {
                       "business_uuid": "{{businessId}}"
                     }
                   },
                   {
                     "query_string": {
                       "fields": [
                         "original_id^1",
                         "customer_name^1",
                         "merchant_name^1",
                         "reference^1",
                         "payment_details.finance_id^1",
                         "payment_details.application_no^1",
                         "customer_email^1"
                       ],
                       "query": "*test query*"
                     }
                   }
                 ],
                 "must_not": [
                   {
                     "match_phrase": {
                       "type": "cash"
                     }
                   }
                 ]
               }
             }
           }
         ],
        "result": {
          "body": {
            "hits": {
               "total": 0,
               "max_score": null,
               "hits": []
            },
            "aggregations": {
              "total_amount": {
                "buckets" : []
              }
            }
          }
        }
      }
      """
    When I send a GET request to "/api/business/{{businessId}}/list?orderBy=total&direction=desc&limit=20&query=test%20query&page=1&currency=EUR&filters%5Bcurrency%5D%5B0%5D%5Bcondition%5D=is&filters%5Bcurrency%5D%5B0%5D%5Bvalue%5D=AFN&filters%5Btype%5D%5B0%5D%5Bcondition%5D=isNot&filters%5Btype%5D%5B0%5D%5Bvalue%5D=cash&filters%5Boriginal_id%5D%5B0%5D%5Bcondition%5D=startsWith&filters%5Boriginal_id%5D%5B0%5D%5Bvalue%5D%5B0%5D=asd&filters%5Breference%5D%5B0%5D%5Bcondition%5D=contains&filters%5Breference%5D%5B0%5D%5Bvalue%5D%5B0%5D=testContains&search=test%20query"
    Then print last response
    And the response status code should be 200
    And Elasticsearch calls stack should contain following ordered messages:
    """
    [
      [
        "search",
        [
          "transactions",
          {
            "query": {
               "bool": {
                 "must": [
                   {
                     "match_phrase": {
                       "currency": "AFN"
                     }
                   },
                   {
                     "query_string": {
                       "fields": [
                         "original_id^1"
                       ],
                       "query": "asd*"
                     }
                   },
                   {
                     "query_string": {
                       "fields": [
                         "reference^1"
                       ],
                       "query": "*testContains*"
                     }
                   },
                   {
                     "match_phrase": {
                       "business_uuid": "{{businessId}}"
                     }
                   },
                   {
                     "query_string": {
                       "fields": [
                         "original_id^1",
                         "customer_name^1",
                         "merchant_name^1",
                         "reference^1",
                         "payment_details.finance_id^1",
                         "payment_details.application_no^1",
                         "customer_email^1"
                       ],
                       "query": "*test query*"
                     }
                   }
                 ],
                 "must_not": [
                   {
                     "match_phrase": {
                       "type": "cash"
                     }
                   }
                 ]
               }
             }
          }
        ]
      ]
    ]
    """

  Scenario: Sending request with dates filter, should build valid filters for elasticsearch
    Given I mock Elasticsearch method "search" with:
      """
      {
        "arguments": [
          "transactions",
          {
           "from": 0,
           "query": {
             "bool": {
               "must": [
                 {
                   "range": {
                     "created_at": {
                       "gte": "2019-10-01T00:00:00.000Z"
                     }
                   }
                 },
                 {
                   "range": {
                     "created_at": {
                       "gte": "2019-10-01T00:00:00.000Z",
                       "lt": "2019-10-02T00:00:00.000Z"
                     }
                   }
                 },
                 {
                   "range": {
                     "created_at": {
                       "lt": "2019-10-10T00:00:00.000Z"
                     }
                   }
                 },
                 {
                   "range": {
                     "created_at": {
                       "gte": "2019-09-30T00:00:00.000Z",
                       "lt": "2019-10-07T00:00:00.000Z"
                     }
                   }
                 },
                 {
                   "match_phrase": {
                     "business_uuid": "{{businessId}}"
                   }
                 }
               ],
               "must_not": [
                 {
                   "range": {
                     "created_at": {
                       "gte": "2019-10-09T00:00:00.000Z",
                       "lt": "2019-10-10T00:00:00.000Z"
                     }
                   }
                 }
               ]
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
        "result": {
          "body": {
            "hits": {
               "total": 0,
               "max_score": null,
               "hits": []
            }
          }
        }
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
                 "must": [
                   {
                     "range": {
                       "created_at": {
                         "gte": "2019-10-01T00:00:00.000Z"
                       }
                     }
                   },
                   {
                     "range": {
                       "created_at": {
                         "gte": "2019-10-01T00:00:00.000Z",
                         "lt": "2019-10-02T00:00:00.000Z"
                       }
                     }
                   },
                   {
                     "range": {
                       "created_at": {
                         "lt": "2019-10-10T00:00:00.000Z"
                       }
                     }
                   },
                   {
                     "range": {
                       "created_at": {
                         "gte": "2019-09-30T00:00:00.000Z",
                         "lt": "2019-10-07T00:00:00.000Z"
                       }
                     }
                   },
                   {
                     "match_phrase": {
                       "business_uuid": "{{businessId}}"
                     }
                   }
                 ],
                 "must_not": [
                   {
                     "range": {
                       "created_at": {
                         "gte": "2019-10-09T00:00:00.000Z",
                         "lt": "2019-10-10T00:00:00.000Z"
                       }
                     }
                   }
                 ]
               }
             }
           }
         ],
        "result": {
          "body": {
            "hits": {
               "total": 0,
               "max_score": null,
               "hits": []
             },
             "aggregations": {
              "status": {
                "buckets" : []
              }
            }
          }
        }
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
               "must": [
                 {
                   "range": {
                     "created_at": {
                       "gte": "2019-10-01T00:00:00.000Z"
                     }
                   }
                 },
                 {
                   "range": {
                     "created_at": {
                       "gte": "2019-10-01T00:00:00.000Z",
                       "lt": "2019-10-02T00:00:00.000Z"
                     }
                   }
                 },
                 {
                   "range": {
                     "created_at": {
                       "lt": "2019-10-10T00:00:00.000Z"
                     }
                   }
                 },
                 {
                   "range": {
                     "created_at": {
                       "gte": "2019-09-30T00:00:00.000Z",
                       "lt": "2019-10-07T00:00:00.000Z"
                     }
                   }
                 },
                 {
                   "match_phrase": {
                     "business_uuid": "{{businessId}}"
                   }
                 }
               ],
               "must_not": [
                 {
                   "range": {
                     "created_at": {
                       "gte": "2019-10-09T00:00:00.000Z",
                       "lt": "2019-10-10T00:00:00.000Z"
                     }
                   }
                 }
               ]
             }
           }
          }
          ],
        "result": {
          "body": {
            "hits": {
               "total": 0,
               "max_score": null,
               "hits": []
             },
             "aggregations": {
              "specific_status": {
                "buckets" : []
              }
            }
          }
        }
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
                 "must": [
                   {
                     "range": {
                       "created_at": {
                         "gte": "2019-10-01T00:00:00.000Z"
                       }
                     }
                   },
                   {
                     "range": {
                       "created_at": {
                         "gte": "2019-10-01T00:00:00.000Z",
                         "lt": "2019-10-02T00:00:00.000Z"
                       }
                     }
                   },
                   {
                     "range": {
                       "created_at": {
                         "lt": "2019-10-10T00:00:00.000Z"
                       }
                     }
                   },
                   {
                     "range": {
                       "created_at": {
                         "gte": "2019-09-30T00:00:00.000Z",
                         "lt": "2019-10-07T00:00:00.000Z"
                       }
                     }
                   },
                   {
                     "match_phrase": {
                       "business_uuid": "{{businessId}}"
                     }
                   }
                 ],
                 "must_not": [
                   {
                     "range": {
                       "created_at": {
                         "gte": "2019-10-09T00:00:00.000Z",
                         "lt": "2019-10-10T00:00:00.000Z"
                       }
                     }
                   }
                 ]
               }
             }
           }
         ],
        "result": {
          "body": {
            "hits": {
               "total": 0,
               "max_score": null,
               "hits": []
            },
            "aggregations": {
              "total_amount": {
                "buckets" : []
              }
            }
          }
        }
      }
      """
    When I send a GET request to "/api/business/{{businessId}}/list?orderBy=created_at&direction=desc&limit=20&query=&page=1&currency=EUR&filters%5Bcreated_at%5D%5B0%5D%5Bcondition%5D=afterDate&filters%5Bcreated_at%5D%5B0%5D%5Bvalue%5D%5B0%5D=2019-10-01&filters%5Bcreated_at%5D%5B1%5D%5Bcondition%5D=isDate&filters%5Bcreated_at%5D%5B1%5D%5Bvalue%5D%5B0%5D=2019-10-01&filters%5Bcreated_at%5D%5B2%5D%5Bcondition%5D=isNotDate&filters%5Bcreated_at%5D%5B2%5D%5Bvalue%5D%5B0%5D=2019-10-09&filters%5Bcreated_at%5D%5B3%5D%5Bcondition%5D=beforeDate&filters%5Bcreated_at%5D%5B3%5D%5Bvalue%5D%5B0%5D=2019-10-09&filters%5Bcreated_at%5D%5B4%5D%5Bcondition%5D=betweenDates&filters%5Bcreated_at%5D%5B4%5D%5Bvalue%5D%5B0%5D%5BdateFrom%5D=2019-09-30T22:00:00.000Z&filters%5Bcreated_at%5D%5B4%5D%5Bvalue%5D%5B0%5D%5BdateTo%5D=2019-10-06T22:00:00.000Z&filters%5Bcreated_at%5D%5B4%5D%5Bvalue%5D%5B0%5D%5Bfrom%5D=2019-09-30T22:00:00.000Z&filters%5Bcreated_at%5D%5B4%5D%5Bvalue%5D%5B0%5D%5Bto%5D=2019-10-06T22:00:00.000Z"
    Then print last response
    And the response status code should be 200
    And Elasticsearch calls stack should contain following ordered messages:
    """
    [
      [
        "search",
        [
          "transactions",
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "range": {
                      "created_at": {
                        "gte": "2019-10-01T00:00:00.000Z"
                      }
                    }
                  },
                  {
                    "range": {
                      "created_at": {
                        "gte": "2019-10-01T00:00:00.000Z",
                        "lt": "2019-10-02T00:00:00.000Z"
                      }
                    }
                  },
                  {
                    "range": {
                      "created_at": {
                        "lt": "2019-10-10T00:00:00.000Z"
                      }
                    }
                  },
                  {
                    "range": {
                      "created_at": {
                        "gte": "2019-09-30T00:00:00.000Z",
                        "lt": "2019-10-07T00:00:00.000Z"
                      }
                    }
                  },
                  {
                    "match_phrase": {
                      "business_uuid": "{{businessId}}"
                    }
                  }
                ],
                "must_not": [
                  {
                    "range": {
                      "created_at": {
                        "gte": "2019-10-09T00:00:00.000Z",
                        "lt": "2019-10-10T00:00:00.000Z"
                      }
                    }
                  }
                ]
              }
            }
          }
        ]
      ]
    ]
    """
