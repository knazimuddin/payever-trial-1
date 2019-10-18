Feature: Transaction settings
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

  Scenario: User doesn't have permission
    When I send a GET request to "/api/business/{{anotherBusinessId}}/settings"
    Then print last response
    And the response status code should be 403

  Scenario: Get settings
    When I send a GET request to "/api/business/{{businessId}}/settings"
    Then print last response
    And the response status code should be 200
    And the response should contain json:
      """
      {
         "columns_to_show": [
           "created_at",
           "customer_email",
           "customer_name",
           "merchant_email",
           "merchant_name",
           "specific_status",
           "status",
           "type"
         ],
         "direction": "",
         "filters": "*",
         "id": "*",
         "limit": "",
         "order_by": ""
      }
      """
