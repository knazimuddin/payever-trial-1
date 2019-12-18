Feature: Integration management

  Scenario: Create integration
    Given I authenticate as a user with the following data:
      """
      {
        "id": "08a3fac8-43ef-4998-99aa-cabc97a39261",
        "email": "email@email.com",
        "roles": [
          {
            "name": "admin",
            "permissions": []
          }
        ]
      }
      """
    And I send a POST request to "/api/integration" with json:
      """
      {
        "name": "shopify",
        "category": "shopsystems"
      }
      """
    And print last response
    Then the response status code should be 201
    When I send a GET request to "/api/integration"
    Then the response status code should be 200
    And the response should contain json:
      """
      [
        {
          "name": "shopify",
          "category": "shopsystems"
        }
      ]
      """

  Scenario: Retrieve integrations as merchant
    Given I use DB fixture "integrations"
    And I authenticate as a user with the following data:
      """
      {
        "id": "08a3fac8-43ef-4998-99aa-cabc97a39261",
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
    When I send a GET request to "/api/integration"
    Then the response status code should be 200
    And the response should contain json:
      """
      [
        {
          "name": "shopify",
          "category": "shopsystems"
        },
        {
          "name": "api",
          "category": "shopsystems"
        }
      ]
      """

  Scenario: Retrieve specific integration as merchant
    Given I use DB fixture "integrations"
    And I authenticate as a user with the following data:
      """
      {
        "id": "08a3fac8-43ef-4998-99aa-cabc97a39261",
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
    When I send a GET request to "/api/integration/api"
    Then the response status code should be 200
    And the response should contain json:
      """
      {
        "name": "api",
        "category": "shopsystems"
      }
      """
