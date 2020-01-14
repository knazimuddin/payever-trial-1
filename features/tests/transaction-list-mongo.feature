Feature: Transaction list for business

  Background:
    Given I remember as "businessId" following value:
      """
      "36bf8981-8827-4c0c-a645-02d9fc6d72c8"
      """
    Given I remember as "userId" following value:
      """
      "08a3fac8-43ef-4998-99aa-cabc97a39261"
      """

  Scenario Outline: No token provided
    Given I am not authenticated
    When I send a GET request to "<uri>"
    Then print last response
    And the response status code should be 403
    Examples:
      | uri                                                                                                      |
      | /api/business/{{businessId}}/mongo?orderBy=created_at&direction=desc&limit=20&query=&page=1&currency=EUR |
      | /api/admin/mongo?orderBy=created_at&direction=desc&limit=20&query=&page=1&currency=EUR                   |
      | /api/user/mongo?orderBy=created_at&direction=desc&limit=20&query=&page=1&currency=EUR                    |

  Scenario Outline: Insufficient token permissions
    Given I authenticate as a user with the following data:
      """
      <token>
      """
    And I remember as "anotherBusinessId" following value:
      """
      "2382ffce-5620-4f13-885d-3c069f9dd9b4"
      """
    When I send a GET request to "<uri>"
    Then print last response
    And the response status code should be 403
    Examples:
      | uri                                                                                                      | token                                                                                                                            |
      | /api/business/{{businessId}}/mongo?orderBy=created_at&direction=desc&limit=20&query=&page=1&currency=EUR | {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{anotherBusinessId}}","acls": []}]}]} |
      | /api/admin/mongo?orderBy=created_at&direction=desc&limit=20&query=&page=1&currency=EUR                   | {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{anotherBusinessId}}","acls": []}]}]} |

  Scenario Outline: Transactions have different currencies, total amount should be converted to the business currency
    Given I authenticate as a user with the following data:
      """
      <token>
      """
    And I get file "features/fixtures/json/transaction-list-mongo/<case_prefix>-transactions-list-response.json" content and remember as "transactionsListJson"
    And I use DB fixture "transactions/transactions-list-with-different-currencies"
    When I send a GET request to "<uri>"
    And print last response
    Then the response should contain json:
      """
      {{transactionsListJson}}
      """
    And the response status code should be 200

    Examples:
      | case_prefix | uri                                                                                                      | token                                                                                                                     |
      | business    | /api/business/{{businessId}}/mongo?orderBy=created_at&direction=desc&limit=20&query=&page=1&currency=EUR | {"email": "email@email.com","roles": [{"name": "merchant","permissions": [{"businessId": "{{businessId}}","acls": []}]}]} |
      | admin       | /api/admin/mongo?orderBy=created_at&direction=desc&limit=20&query=&page=1&currency=EUR                   | {"email": "email@email.com","roles": [{"name": "admin","permissions": []}]}                                               |
