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
    Given print database connection url
    Given I use DB fixture "transactions/example"
    Given I set header "test" with value "testtest"
    When I send a POST request to "/api/status" with json:
    """
    {
      "json": "json"
    }
    """
    Then print last response
    Then the response status code should be 404
