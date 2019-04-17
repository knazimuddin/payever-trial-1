Feature: Business Controller
  Scenario: Get transactions list
    Given I use DB fixture "transactions"

    When I send a GET request to "/api/business/8ed682d3-6319-4828-b264-834a863f79a7/list"

    Then the response status code should be 200
    And the response should contain json:
    """
    {
      "collection": [
        {
           "action_running": false,
           "santander_applications": [],
           "_id": "5c0a8e3781a52900101320b8",
           "uuid": "c3735d0c-b70a-4e1c-9434-c8239deb6389",
           "original_id": "a1a39985f866f72679ffc9fb4841ad53",
           "business_uuid": "8ed682d3-6319-4828-b264-834a863f79a7",
           "invoice_id": "invoice_id",
           "created_at": "*",
           "updated_at": "*",
           "history": [],
           "items": []

        }
      ]
    }
    """
