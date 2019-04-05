Feature: API status endpoint
  Scenario: Check whether API status endpoint GET works
    When I send a GET request to "/api/status"
    Then the response status code should be 200
    And the response should contain json:
    """
    {
      "status": "ok",
      "version": "*"
    }
    """

  Scenario: Check whether API status endpoint POST works
    Given print database name
    Given I use DB fixture "transactions/example"
    Given I set header "test" with value "testtest"
    When I send a POST request to "/api/status" with json:
    """
    {
      "json": "json"
    }
    """
    Then print last response
    Then the response status code should be 200
    And the response should contain json:
    """
    {
      "status": "ok",
      "version": "*",
      "body": {
        "json": "json"
      },
      "headers": {
        "test": "testtest"
      }
    }
    """

  Scenario: Check whether API status endpoint POST works
    Given print database name
    Given I use DB fixture "transactions/example"
    When I send a GET request to "/api/business/4a47b37f-6ad1-11e7-9350-305a3a774e3f/detail/a45e5785-7495-11e8-9656-901b0efbaca6"
    Then print last response
#    Then the response status code should be 200

